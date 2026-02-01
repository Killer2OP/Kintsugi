import { NextResponse } from 'next/server';
import { mockEffectivenessStats } from '@/lib/mock-data';

export async function GET() {
  try {
    const { patternAnalyzer } = await import('@/lib/services/analytics');
    console.log('📊 Generating fix effectiveness statistics');

    const stats = await patternAnalyzer.getFixEffectivenessStats();

    return NextResponse.json({
      message: 'Fix effectiveness analysis completed',
      statistics: stats,
      source: 'database',
    });
  } catch (error) {
    console.warn('Effectiveness analysis failed, using mock data:', error);

    // Return mock effectiveness stats when database is unavailable
    return NextResponse.json({
      ...mockEffectivenessStats,
      source: 'mock',
      note: 'Using demo data - database offline',
    });
  }
}
