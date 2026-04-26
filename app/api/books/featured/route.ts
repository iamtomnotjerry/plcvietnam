import { NextRequest, NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';

export const revalidate = 3600;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const limit = Math.min(
    20,
    Math.max(1, parseInt(new URL(request.url).searchParams.get('limit') ?? '3', 10))
  );
  try {
    const books = await contentRepository.getFeaturedBooks(limit);
    return NextResponse.json(books);
  } catch (e) {
    console.error('[api/books/featured]', e);
    return NextResponse.json([], { status: 500 });
  }
}
