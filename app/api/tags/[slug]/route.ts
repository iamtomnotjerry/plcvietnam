import { NextRequest, NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';
import { apiInternalError, apiNotFound } from '@/lib/api/responses';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await context.params;
  try {
    const tag = await contentRepository.getTagBySlug(slug);
    if (!tag) return apiNotFound('Không tìm thấy');
    return NextResponse.json(tag);
  } catch (e) {
    console.error('[api/tags/[slug]]', e);
    return apiInternalError('Lỗi server');
  }
}
