import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { githubService } from '@/lib/services/github';

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

    // Update status to approved
    await prisma.workflowRun.update({
      where: { id: fixId },
      data: { fixStatus: 'approved' },
    });

    console.log(`✅ Fix ${fixId} approved`);

    // Try to apply fix to repository
    try {
      if (fix.suggestedFix && fix.owner && fix.repoName) {
        await prisma.workflowRun.update({
          where: { id: fixId },
          data: { fixStatus: 'applying' },
        });

        const result = await githubService.applyFixToRepository(
          fix.owner,
          fix.repoName,
          fix.suggestedFix,
          String(fixId)
        );

        if (result) {
          await prisma.workflowRun.update({
            where: { id: fixId },
            data: {
              fixStatus: 'applied',
              prUrl: result.pull_request?.html_url || null,
              fixBranch: result.branch_name,
            },
          });

          return NextResponse.json({
            message: 'Fix approved and applied successfully',
            fix_id: id,
            pr_url: result.pull_request?.html_url,
            branch_name: result.branch_name,
          });
        }
      }

      return NextResponse.json({
        message: 'Fix approved',
        fix_id: id,
      });
    } catch (applyError) {
      console.error(`Failed to apply fix ${fixId}:`, applyError);
      await prisma.workflowRun.update({
        where: { id: fixId },
        data: {
          fixStatus: 'approved_application_failed',
          fixError: String(applyError),
        },
      });

      return NextResponse.json({
        message: 'Fix approved but application failed',
        fix_id: id,
        error: String(applyError),
      });
    }
  } catch (error) {
    console.error('Failed to approve fix:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
