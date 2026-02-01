import { NextRequest, NextResponse } from 'next/server';
import { successPredictor } from '@/lib/services/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { error_log, suggested_fix, repo_context } = body;

    if (!error_log || !suggested_fix) {
      return NextResponse.json(
        { error: 'error_log and suggested_fix are required' },
        { status: 400 }
      );
    }

    console.log(`🎯 Predicting fix success for ${repo_context}`);

    const prediction = successPredictor.predictFixSuccess(
      error_log,
      suggested_fix,
      repo_context || ''
    );

    return NextResponse.json({
      message: 'Fix success prediction completed',
      repo_context,
      prediction,
    });
  } catch (error) {
    console.error('Fix success prediction failed:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
