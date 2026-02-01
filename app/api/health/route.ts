import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { HealthResponse } from '@/lib/types/index';

export async function GET() {
  try {
    // Test database connection
    let dbStatus = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }

    // Check GitHub API availability
    const githubStatus = process.env.GITHUB_TOKEN ? 'available' : 'unavailable';

    // Check Gemini API availability
    const geminiStatus = (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY) ? 'available' : 'unavailable';

    const response: HealthResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        github_api: githubStatus,
        gemini_api: geminiStatus,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: String(error),
      },
      { status: 503 }
    );
  }
}
