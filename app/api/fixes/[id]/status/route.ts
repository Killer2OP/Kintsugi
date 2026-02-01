import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fixId = parseInt(id);

    if (isNaN(fixId)) {
      return NextResponse.json({ error: 'Invalid fix ID' }, { status: 400 });
    }

    const fix = await prisma.workflowRun.findUnique({
      where: { id: fixId },
    });

    if (!fix) {
      return NextResponse.json({ error: 'Fix not found' }, { status: 404 });
    }

    return NextResponse.json({
      fix_id: id,
      status: fix.fixStatus,
      pr_url: fix.prUrl,
      branch_name: fix.fixBranch,
      error_message: fix.fixError,
      created_at: fix.createdAt,
      updated_at: fix.updatedAt,
    });
  } catch (error) {
    console.error('Failed to get fix status:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
