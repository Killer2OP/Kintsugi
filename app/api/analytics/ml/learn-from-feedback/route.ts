import { NextRequest, NextResponse } from 'next/server';
import { mlRecognizer } from '@/lib/services/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { error_log, suggested_fix, fix_status, repo_context } = body;

    if (!error_log || !suggested_fix || !fix_status) {
      return NextResponse.json(
        { error: 'error_log, suggested_fix, and fix_status are required' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected', 'pending'].includes(fix_status)) {
      return NextResponse.json(
        { error: "fix_status must be 'approved', 'rejected', or 'pending'" },
        { status: 400 }
      );
    }

    console.log(`📚 Learning from feedback: ${fix_status} for ${repo_context}`);

    mlRecognizer.learnFromFeedback(
      error_log,
      suggested_fix,
      fix_status,
      repo_context || ''
    );

    return NextResponse.json({
      message: 'Feedback learned successfully',
      repo_context,
      fix_status,
      learning_status: 'completed',
    });
  } catch (error) {
    console.error('Learning from feedback failed:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
