import { NextRequest, NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await context.params;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));

  try {
    const result = await contentRepository.getPostsByTag(slug, { page, limit });
    return NextResponse.json(result);
  } catch (e) {
    console.error('[api/tags/[slug]/posts]', e);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
