import { NextRequest, NextResponse } from 'next/server';
import { repoLearning } from '@/lib/services/analytics';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const { owner, repo } = await params;

    console.log(`🏗️ Building repository profile for ${owner}/${repo}`);

    const profile = await repoLearning.buildRepositoryProfile(owner, repo);

    return NextResponse.json({
      message: 'Repository profile generated',
      profile,
    });
  } catch (error) {
    console.error('Repository profile generation failed:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
