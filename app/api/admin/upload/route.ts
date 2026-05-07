/**
 * Image Upload API
 * Handles file uploads to Supabase Storage.
 * Requires editor/admin role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/supabase/storage';
import { apiBadRequest, apiInternalError, apiUnauthorized } from '@/lib/api/responses';
import { requireEditorAuth } from '@/lib/auth/server-auth';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const SAFE_PATH_PATTERN = /^[a-zA-Z0-9/_-]+$/;

function unauthorized() {
  return apiUnauthorized();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireEditorAuth();
  if (!auth) {
    return unauthorized();
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  const file = formData.get('file');
  const bucket = formData.get('bucket') as string | null;
  const path = formData.get('path') as string | null;

  if (!(file instanceof File)) {
    return apiBadRequest('Thiếu file');
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return apiBadRequest('Chỉ hỗ trợ JPEG, PNG, WebP, GIF');
  }
  if (file.size > MAX_SIZE) {
    return apiBadRequest('File tối đa 5MB');
  }

  const targetBucket =
    bucket === 'thumbnails' || bucket === 'avatars' || bucket === 'books' ? bucket : 'thumbnails';

  const ext = file.name.split('.').pop() ?? 'jpg';
  const providedPath = typeof path === 'string' ? path.trim() : '';
  const unsafePath =
    providedPath.includes('..') ||
    providedPath.startsWith('/') ||
    !SAFE_PATH_PATTERN.test(providedPath);
  if (providedPath && unsafePath) {
    return apiBadRequest('Đường dẫn upload không hợp lệ');
  }

  const safeUserId =
    typeof auth.userId === 'string' && auth.userId.trim() ? auth.userId.trim() : 'unknown';
  const targetPath =
    providedPath && providedPath.startsWith(`uploads/${safeUserId}/`)
      ? providedPath
      : `uploads/${safeUserId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  try {
    const url = await uploadFile(targetBucket, targetPath, file, file.type);
    return NextResponse.json({ url }, { status: 201 });
  } catch (e) {
    console.error('[upload]', e);
    return apiInternalError('Upload thất bại');
  }
}
