import { NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';

export const revalidate = 3600; // 1 hour ISR

export async function GET(): Promise<NextResponse> {
  try {
    const tree = await contentRepository.getNavigationTree();
    return NextResponse.json(tree, {
      headers: {
        // Cache at CDN edge for 5 min, stale-while-revalidate for 1 hour
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    });
  } catch (e) {
    console.error('[api/navigation]', e);
    return NextResponse.json([], { status: 500 });
  }
}
