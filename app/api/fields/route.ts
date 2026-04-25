import { NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';

export const revalidate = 3600; // 1 hour ISR

export async function GET(): Promise<NextResponse> {
  try {
    const fields = await contentRepository.getFields();
    return NextResponse.json(fields);
  } catch (e) {
    console.error('[api/fields]', e);
    return NextResponse.json({ error: 'Không thể tải dữ liệu' }, { status: 500 });
  }
}
