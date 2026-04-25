/**
 * Image Upload API
 * Handles file uploads to Supabase Storage.
 * Requires editor/admin role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { uploadFile } from '@/lib/supabase/storage';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function unauthorized() {
  return NextResponse.json({ error: 'Không có quyền' }, { status: 401 });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session?.user || (role !== 'admin' && role !== 'author')) {
    return unauthorized();
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const file = formData.get('file');
  const bucket = formData.get('bucket') as string | null;
  const path = formData.get('path') as string | null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Thiếu file' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Chỉ hỗ trợ JPEG, PNG, WebP, GIF' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File tối đa 5MB' }, { status: 400 });
  }

  const targetBucket =
    bucket === 'thumbnails' || bucket === 'avatars' || bucket === 'books' ? bucket : 'thumbnails';

  const ext = file.name.split('.').pop() ?? 'jpg';
  const targetPath = path ?? `uploads/${Date.now()}.${ext}`;

  try {
    const url = await uploadFile(targetBucket, targetPath, file, file.type);
    return NextResponse.json({ url }, { status: 201 });
  } catch (e) {
    console.error('[upload]', e);
    return NextResponse.json({ error: 'Upload thất bại' }, { status: 500 });
  }
}
