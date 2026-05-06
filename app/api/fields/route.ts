import { NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';
import { apiInternalError } from '@/lib/api/responses';

export const revalidate = 3600; // 1 hour ISR

export async function GET(): Promise<NextResponse> {
  try {
    const fields = await contentRepository.getFields();
    return NextResponse.json(fields);
  } catch (e) {
    console.error('[api/fields]', e);
    return apiInternalError('Không thể tải dữ liệu');
  }
}
