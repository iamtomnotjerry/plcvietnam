import { NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';

export const revalidate = 3600; // 1 hour ISR

export async function GET(): Promise<NextResponse> {
  try {
    const tags = await contentRepository.getTags();
    return NextResponse.json(tags);
  } catch (e) {
    console.error('[api/tags]', e);
    return NextResponse.json({ error: 'Không thể tải dữ liệu' }, { status: 500 });
  }
}
