import { NextResponse } from 'next/server';
import { mlRecognizer } from '@/lib/services/analytics';

export async function GET() {
  try {
    console.log('🧠 Generating ML pattern insights');

    const insights = mlRecognizer.getPatternInsights();

    return NextResponse.json({
      message: 'ML pattern insights generated',
      insights,
      recommendations: [
        'High success rate patterns indicate reliable fix approaches',
        'Recent patterns are more likely to be relevant to current issues',
        'Repositories with many patterns have diverse failure scenarios',
      ],
    });
  } catch (error) {
    console.error('Pattern insights generation failed:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
