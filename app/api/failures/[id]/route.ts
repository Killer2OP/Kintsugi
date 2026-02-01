import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const failureId = parseInt(id);

    if (isNaN(failureId)) {
      return NextResponse.json({ error: 'Invalid failure ID' }, { status: 400 });
    }

    const failure = await prisma.workflowRun.findUnique({
      where: { id: failureId },
    });

    if (!failure) {
      return NextResponse.json({ error: 'Failure not found' }, { status: 404 });
    }

    return NextResponse.json({
      failure: {
        id: failure.id,
        repo_name: failure.repoName,
        owner: failure.owner,
        workflow_name: failure.workflowName,
        run_id: Number(failure.runId),
        status: failure.status,
        conclusion: failure.conclusion,
        error_log: failure.errorLog,
        suggested_fix: failure.suggestedFix,
        fix_status: failure.fixStatus,
        confidence_score: failure.confidenceScore,
        error_category: failure.errorCategory,
        fix_complexity: failure.fixComplexity,
        analysis_result: failure.analysisResult,
        created_at: failure.createdAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Failed to get failure:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
