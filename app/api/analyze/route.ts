import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { geminiAgent } from '@/lib/services/gemini';
import { AnalysisRequest, AnalysisResponse } from '@/lib/types/index';

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
              ? analysisResult.suggested_fix.description || JSON.stringify(analysisResult.suggested_fix)
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
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { owner, repo, run_id } = body;

    if (!owner || !repo || !run_id) {
      return NextResponse.json(
        { error: 'owner, repo, and run_id are required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Manual analysis triggered for ${owner}/${repo} run #${run_id}`);

    // Store failure data
    const failure = await prisma.workflowRun.upsert({
      where: {
        repoName_owner_runId: {
          repoName: repo,
          owner: owner,
          runId: BigInt(run_id),
        },
      },
      update: {
        status: 'completed',
        conclusion: 'failure',
      },
      create: {
        repoName: repo,
        owner: owner,
        runId: BigInt(run_id),
        workflowName: 'Manual Analysis',
        status: 'completed',
        conclusion: 'failure',
      },
    });

    // Trigger async analysis
    analyzeFailureAsync(owner, repo, run_id, failure.id);

    const response: AnalysisResponse = {
      message: 'Analysis triggered successfully',
      failure_id: String(failure.id),
      owner,
      repo,
      run_id,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Manual analysis failed:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
