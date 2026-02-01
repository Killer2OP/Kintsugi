import { NextRequest, NextResponse } from 'next/server';
import { mockPatternAnalysis } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const daysBack = parseInt(searchParams.get('days_back') || '30');

  try {
    const { patternAnalyzer } = await import('@/lib/services/analytics');
    console.log(`🔍 Analyzing failure patterns for last ${daysBack} days`);

    const patterns = await patternAnalyzer.analyzeFailurePatterns(daysBack);

    return NextResponse.json({
      message: 'Pattern analysis completed',
      analysis: patterns,
      source: 'database',
    });
  } catch (error) {
    console.warn('Pattern analysis failed, using mock data:', error);

    // Return mock pattern analysis when database is unavailable
    return NextResponse.json({
      ...mockPatternAnalysis,
      source: 'mock',
      note: 'Using demo data - database offline',
    });
  }
}
