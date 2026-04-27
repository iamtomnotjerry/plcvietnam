/**
 * Search API Route
 * GET /api/search?q=...
 *
 * ✅ Security: Zod validation, XSS protection
 * ✅ Performance: Singleton Supabase client (via contentRepository)
 */

import { NextRequest, NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';
import { SearchSchema } from '@/lib/validation/schemas';
import { ZodError } from 'zod';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  // Validate search query
  try {
    SearchSchema.parse({ q: query });
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError.message, posts: [], books: [], totalResults: 0 },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Từ khóa tìm kiếm không hợp lệ', posts: [], books: [], totalResults: 0 },
      { status: 400 }
    );
  }

  try {
    const results = await contentRepository.search(query);
    return NextResponse.json(results);
  } catch (e) {
    console.error('[api/search]', e);
    return NextResponse.json({ error: 'Tìm kiếm thất bại' }, { status: 500 });
  }
}
