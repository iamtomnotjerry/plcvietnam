import { NextRequest, NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await context.params;
  try {
    const tag = await contentRepository.getTagBySlug(slug);
    if (!tag) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
    return NextResponse.json(tag);
  } catch (e) {
    console.error('[api/tags/[slug]]', e);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
