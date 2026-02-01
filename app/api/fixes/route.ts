import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { mockPendingFixes } from '@/lib/mock-data';

export async function GET() {
  try {
    const fixes = await prisma.workflowRun.findMany({
      where: {
        fixStatus: { in: ['pending', 'suggested', 'waiting_approval'] },
        suggestedFix: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedFixes = fixes.map((f) => ({
      id: f.id,
      repo_name: f.repoName,
      owner: f.owner,
      run_id: Number(f.runId),
      workflow_name: f.workflowName,
      suggested_fix: f.suggestedFix,
      fix_status: f.fixStatus,
      confidence_score: f.confidenceScore,
      error_category: f.errorCategory,
      fix_complexity: f.fixComplexity,
      created_at: f.createdAt?.toISOString() || null,
      updated_at: f.updatedAt?.toISOString() || null,
    }));

    return NextResponse.json({ 
      pending_fixes: formattedFixes,
      source: 'database',
    });
  } catch (error) {
    console.warn('Database unavailable, using mock data:', error);
    
    // Return mock data when database is unavailable
    return NextResponse.json({ 
      pending_fixes: mockPendingFixes,
      source: 'mock',
      note: 'Using demo data - database offline',
    });
  }
}
