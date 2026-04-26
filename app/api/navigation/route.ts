import { NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';

export const revalidate = 3600; // 1 hour

export async function GET(): Promise<NextResponse> {
  try {
    const tree = await contentRepository.getNavigationTree();
    return NextResponse.json(tree);
  } catch (e) {
    console.error('[api/navigation]', e);
    return NextResponse.json([], { status: 500 });
  }
}
