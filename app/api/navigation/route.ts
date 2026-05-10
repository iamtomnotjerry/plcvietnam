import { NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';

/** Navigation changes from CMS; must not serve stale ISR/CDN cached trees after edits. */
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const tree = await contentRepository.getNavigationTree();
    return NextResponse.json(tree, {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (e) {
    console.error('[api/navigation]', e);
    return NextResponse.json([], { status: 500 });
  }
}
