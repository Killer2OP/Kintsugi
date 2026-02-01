import { NextResponse } from 'next/server';
import { getModelPerformance } from '@/lib/services/analytics';

export async function GET() {
  try {
    console.log('📊 Analyzing ML model performance');

    const performance = await getModelPerformance();

    return NextResponse.json({
      message: 'ML model performance analysis completed',
      performance,
    });
  } catch (error) {
    console.error('Model performance analysis failed:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
