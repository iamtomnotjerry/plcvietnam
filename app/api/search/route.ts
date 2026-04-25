import { NextRequest, NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (!query || query.length < 2) {
    return NextResponse.json({ posts: [], books: [], totalResults: 0 });
  }

  try {
    const results = await contentRepository.search(query);
    return NextResponse.json(results);
  } catch (e) {
    console.error('[api/search]', e);
    return NextResponse.json({ error: 'Tìm kiếm thất bại' }, { status: 500 });
  }
}
