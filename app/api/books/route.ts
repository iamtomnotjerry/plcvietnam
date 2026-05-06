import { NextRequest, NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';
import { apiInternalError } from '@/lib/api/responses';

export const revalidate = 3600;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));

  try {
    const result = await contentRepository.getBooks({ page, limit });
    return NextResponse.json(result);
  } catch (e) {
    console.error('[api/books]', e);
    return apiInternalError('Không thể tải sách');
  }
}
