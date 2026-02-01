import { NextRequest, NextResponse } from 'next/server';
import { fixGenerator } from '@/lib/services/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { error_log, repo_context, base_fix } = body;

    if (!error_log) {
      return NextResponse.json({ error: 'error_log is required' }, { status: 400 });
    }

    console.log(`🧠 Generating enhanced fix for ${repo_context}`);

    const enhancedFix = await fixGenerator.generateEnhancedFix(
      error_log,
      repo_context || '',
      base_fix
    );

    return NextResponse.json({
      message: 'Enhanced fix generation completed',
      repo_context,
      enhanced_fix: enhancedFix,
    });
  } catch (error) {
    console.error('Enhanced fix generation failed:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
