/**
 * Admin Categories API - CRUD for categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/lib/supabase/database.types';
import { apiBadRequest, apiConflict, apiInternalError, apiUnauthorized } from '@/lib/api/responses';
import { requireAdminAuth, requireEditorAuth } from '@/lib/auth/server-auth';
import { logAdminChecklogEvent } from '@/lib/checklog/log-admin-event';

function unauthorized() {
  return apiUnauthorized();
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await requireEditorAuth())) return unauthorized();

  const fieldId = new URL(request.url).searchParams.get('fieldId');
  const db = getServiceClient();

  let query = db.from('categories').select('*, fields(id, name, slug)').order('name');
  if (fieldId) query = query.eq('field_id', fieldId);

  const { data, error } = await query;
  if (error) return apiInternalError('Không thể tải danh mục');
  return NextResponse.json(data);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (!auth) return unauthorized();

  let body: { slug?: string; name?: string; description?: string; fieldId?: string };
  try {
    body = await request.json();
  } catch {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const fieldId = typeof body.fieldId === 'string' ? body.fieldId.trim() : '';

  if (!slug || !name || !fieldId) {
    return apiBadRequest('Thiếu slug, name hoặc fieldId');
  }

  const db = getServiceClient();
  const { data, error } = await db
    .from('categories')
    .insert({ slug, name, description: body.description ?? null, field_id: fieldId })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return apiConflict('Slug đã tồn tại');
    return apiInternalError('Không thể tạo danh mục');
  }

  logAdminChecklogEvent({
    request,
    auth,
    channel: 'categories.create',
    outcome: 'success',
    metadata: { categoryId: data.id, slug, fieldId },
  });

  // Revalidate navigation and posts cache
  revalidatePath('/api/navigation');
  revalidatePath('/');
  revalidatePath('/posts');

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (!auth) return unauthorized();

  let body: { id?: string; slug?: string; name?: string; description?: string };
  try {
    body = await request.json();
  } catch {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  if (!body.id) return apiBadRequest('Thiếu id');

  const update: Database['public']['Tables']['categories']['Update'] = {};
  if (body.slug) update.slug = body.slug;
  if (body.name) update.name = body.name;
  if (body.description !== undefined) update.description = body.description ?? null;

  const db = getServiceClient();
  const { data, error } = await db
    .from('categories')
    .update(update)
    .eq('id', body.id)
    .select()
    .single();

  if (error) return apiInternalError('Không thể cập nhật danh mục');

  logAdminChecklogEvent({
    request,
    auth,
    channel: 'categories.update',
    outcome: 'success',
    metadata: { categoryId: body.id },
  });

  // Revalidate navigation and posts cache
  revalidatePath('/api/navigation');
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
  const { error } = await db.from('categories').delete().eq('id', id);
  if (error) return apiInternalError('Không thể xóa danh mục');

  logAdminChecklogEvent({
    request,
    auth,
    channel: 'categories.delete',
    outcome: 'success',
    metadata: { categoryId: id },
  });

  // Revalidate navigation and posts cache
  revalidatePath('/api/navigation');
  revalidatePath('/');
  revalidatePath('/posts');

  return NextResponse.json({ ok: true });
}
