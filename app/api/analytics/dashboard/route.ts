import { NextResponse } from 'next/server';
import { mockDashboardData } from '@/lib/mock-data';

export async function GET() {
  try {
    // Try to generate dashboard from database
    const { generateDashboard } = await import('@/lib/services/analytics');
    console.log('📈 Generating analytics dashboard');

    const dashboard = await generateDashboard();

    return NextResponse.json({
      message: 'Analytics dashboard generated',
      dashboard,
      source: 'database',
    });
  } catch (error) {
    console.warn('Dashboard generation failed, using mock data:', error);

    // Return mock dashboard data when database is unavailable
    return NextResponse.json({
      message: 'Analytics dashboard generated (demo mode)',
      dashboard: mockDashboardData,
      source: 'mock',
      note: 'Using demo data - database offline',
    });
  }
}
