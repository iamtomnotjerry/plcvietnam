/**
 * POST /api/posts/[id]/view
 * Increments view count for a post.
 * Called client-side after post loads.
 */

import { NextRequest, NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });

  try {
    await contentRepository.incrementViewCount(id);
    return NextResponse.json({ ok: true });
  } catch {
    // Non-fatal - don't fail the request
    return NextResponse.json({ ok: false });
  }
}
