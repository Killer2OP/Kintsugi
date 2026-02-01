import { NextRequest, NextResponse } from 'next/server';
import { mlRecognizer } from '@/lib/services/analytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { error_log, repo_context, min_similarity = 0.3 } = body;

    if (!error_log) {
      return NextResponse.json({ error: 'error_log is required' }, { status: 400 });
    }

    console.log(`🔍 Finding similar fixes for error in ${repo_context}`);

    const similarFixes = await mlRecognizer.findSimilarFixes(
      error_log,
      repo_context || '',
      min_similarity
    );

    return NextResponse.json({
      message: 'Similar fixes analysis completed',
      repo_context,
      similar_fixes_count: similarFixes.length,
      similar_fixes: similarFixes,
      min_similarity_threshold: min_similarity,
    });
  } catch (error) {
    console.error('Similar fixes analysis failed:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
