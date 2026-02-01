import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(
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

    if (fix.fixStatus !== 'pending' && fix.fixStatus !== 'suggested') {
      return NextResponse.json(
        { error: 'Fix is not in pending state' },
        { status: 400 }
      );
    }

    await prisma.workflowRun.update({
      where: { id: fixId },
      data: { fixStatus: 'rejected' },
    });

    console.log(`❌ Fix ${fixId} rejected`);

    return NextResponse.json({
      message: 'Fix rejected successfully',
      fix_id: id,
    });
  } catch (error) {
    console.error('Failed to reject fix:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
