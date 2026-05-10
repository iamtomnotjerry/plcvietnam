/**
 * Admin Tags API - CRUD for tags
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import { revalidatePath } from 'next/cache';
import { apiBadRequest, apiConflict, apiInternalError, apiUnauthorized } from '@/lib/api/responses';
import { requireAdminAuth, requireEditorAuth } from '@/lib/auth/server-auth';
import { logAdminChecklogEvent } from '@/lib/checklog/log-admin-event';

function unauthorized() {
  return apiUnauthorized();
}

export async function GET(): Promise<NextResponse> {
  if (!(await requireEditorAuth())) return unauthorized();

  const db = getServiceClient();
  const { data, error } = await db.from('tags').select('*').order('name');
  if (error) return apiInternalError('Không thể tải tag');
  return NextResponse.json(data);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (!auth) return unauthorized();

  let body: { slug?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!slug || !name) return apiBadRequest('Thiếu slug hoặc name');

  const db = getServiceClient();
  const { data, error } = await db.from('tags').insert({ slug, name }).select().single();
  if (error) {
    if (error.code === '23505') return apiConflict('Slug đã tồn tại');
    return apiInternalError('Không thể tạo tag');
  }

  logAdminChecklogEvent({
    request,
    auth,
    channel: 'tags.create',
    outcome: 'success',
    metadata: { tagId: data.id, slug },
  });

  // Revalidate tags and posts cache
  revalidatePath('/api/tags');
  revalidatePath('/');
  revalidatePath('/posts');

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (!auth) return unauthorized();

  let body: { id?: string; slug?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  const id = typeof body.id === 'string' ? body.id.trim() : '';
  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!id || !slug || !name) return apiBadRequest('Thiếu id, slug hoặc name');

  const db = getServiceClient();
  const { data, error } = await db
    .from('tags')
    .update({ slug, name })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return apiConflict('Slug đã tồn tại');
    return apiInternalError('Không thể cập nhật tag');
  }

  logAdminChecklogEvent({
    request,
    auth,
    channel: 'tags.update',
    outcome: 'success',
    metadata: { tagId: id },
  });

  // Revalidate tags and posts cache
  revalidatePath('/api/tags');
  revalidatePath('/');
  revalidatePath('/posts');

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (!auth) return unauthorized();

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return apiBadRequest('Thiếu id');

  const db = getServiceClient();
  const { error } = await db.from('tags').delete().eq('id', id);
  if (error) return apiInternalError('Không thể xóa tag');

  logAdminChecklogEvent({
    request,
    auth,
    channel: 'tags.delete',
    outcome: 'success',
    metadata: { tagId: id },
  });

  // Revalidate tags and posts cache
  revalidatePath('/api/tags');
  revalidatePath('/');
  revalidatePath('/posts');

  return NextResponse.json({ ok: true });
}
