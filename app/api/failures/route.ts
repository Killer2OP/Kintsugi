import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { mockWorkflowRuns } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    // Try to fetch from database
    const failures = await prisma.workflowRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const formattedFailures = failures.map((f) => ({
      id: f.id,
      repo_name: f.repoName,
      owner: f.owner,
      workflow_name: f.workflowName,
      run_id: Number(f.runId),
      status: f.status,
      conclusion: f.conclusion,
      error_log: f.errorLog,
      suggested_fix: f.suggestedFix,
      fix_status: f.fixStatus,
      confidence_score: f.confidenceScore,
      error_category: f.errorCategory,
      fix_complexity: f.fixComplexity,
      created_at: f.createdAt?.toISOString() || null,
    }));

    return NextResponse.json({
      failures: formattedFailures,
      count: formattedFailures.length,
      source: 'database',
    });
  } catch (error) {
    console.warn('Database unavailable, using mock data:', error);
    
    // Return mock data when database is unavailable
    const mockData = mockWorkflowRuns.slice(0, limit);
    return NextResponse.json({
      failures: mockData,
      count: mockData.length,
      source: 'mock',
      note: 'Using demo data - database offline',
    });
  }
}
