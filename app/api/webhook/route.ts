import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/db/prisma';
import { geminiAgent } from '@/lib/services/gemini';
import { WebhookPayload } from '@/lib/types/index';

async function analyzeFailureAsync(
  owner: string,
  repo: string,
  runId: number,
  failureId: number
) {
  try {
    console.log(`🔍 Starting analysis for ${owner}/${repo} run #${runId}`);

    const analysisResult = await geminiAgent.analyzeFailure(owner, repo, runId);

    if (analysisResult) {
      await prisma.workflowRun.update({
        where: { id: failureId },
        data: {
          analysisResult: JSON.stringify(analysisResult),
          suggestedFix: analysisResult.suggested_fix
            ? typeof analysisResult.suggested_fix === 'object'
              ? (analysisResult.suggested_fix as { description?: string }).description || JSON.stringify(analysisResult.suggested_fix)
              : String(analysisResult.suggested_fix)
            : null,
          fixStatus: 'pending',
          confidenceScore: analysisResult.confidence === 'high' ? 0.9 : analysisResult.confidence === 'medium' ? 0.7 : 0.5,
          errorCategory: analysisResult.error_type,
          fixComplexity: analysisResult.risk_level,
        },
      });
      console.log(`✅ Analysis stored for failure ${failureId}`);
    }
  } catch (error) {
    console.error(`❌ Analysis error for ${owner}/${repo} run #${runId}:`, error);
    await prisma.workflowRun.update({
      where: { id: failureId },
      data: {
        analysisResult: JSON.stringify({
          error: String(error),
          error_type: 'analysis_failure',
          timestamp: new Date().toISOString(),
        }),
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('X-Hub-Signature-256');
    const body = await request.text();
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const expectedSignature =
        'sha256=' +
        crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 403 });
      }
    }

    let payload: WebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    if (!payload.action || !payload.repository) {
      return NextResponse.json({ message: 'Webhook received but missing required fields' });
    }

    const eventType = request.headers.get('X-GitHub-Event');
    let workflowData = null;

    if (eventType === 'workflow_run' && payload.workflow_run) {
      workflowData = payload.workflow_run;
    } else if (eventType === 'workflow_job' && payload.workflow_job) {
      workflowData = {
        id: payload.workflow_job.run_id,
        name: payload.workflow_job.workflow_name || 'Unknown',
        conclusion: payload.workflow_job.conclusion,
        html_url: payload.workflow_job.run_url || payload.workflow_job.html_url,
        created_at: payload.workflow_job.created_at,
        updated_at: payload.workflow_job.completed_at || payload.workflow_job.created_at,
      };
    } else {
      return NextResponse.json({ message: `Unsupported event type: ${eventType}` });
    }

    // Process failed workflows
    if (payload.action === 'completed' && workflowData?.conclusion === 'failure') {
      const owner = payload.repository.owner.login;
      const repo = payload.repository.name;
      const runId = workflowData.id;

      console.log(`🔥 Detected failed workflow: ${owner}/${repo} run #${runId}`);

      // Store failure in database
      const failure = await prisma.workflowRun.upsert({
        where: {
          repoName_owner_runId: {
            repoName: repo,
            owner: owner,
            runId: BigInt(runId),
          },
        },
        update: {
          status: 'completed',
          conclusion: 'failure',
          errorLog: JSON.stringify(payload),
        },
        create: {
          repoName: repo,
          owner: owner,
          runId: BigInt(runId),
          workflowName: workflowData.name,
          status: 'completed',
          conclusion: 'failure',
          errorLog: JSON.stringify(payload),
        },
      });

      console.log(`📝 Stored failure with ID: ${failure.id}`);

      // Async analysis (don't await)
      analyzeFailureAsync(owner, repo, runId, failure.id);

      return NextResponse.json({
        message: 'Webhook processed successfully',
        failure_id: String(failure.id),
      });
    }

    return NextResponse.json({ message: 'Webhook received but no action taken' });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
