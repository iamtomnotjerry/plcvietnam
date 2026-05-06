/**
 * Admin Fields API - CRUD for fields (lĩnh vực)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { revalidatePath } from 'next/cache';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import type { Database } from '@/lib/supabase/database.types';
import { apiBadRequest, apiConflict, apiInternalError, apiUnauthorized } from '@/lib/api/responses';

function unauthorized() {
  return apiUnauthorized();
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') return null;
  return session;
}

export async function GET(): Promise<NextResponse> {
  if (!(await requireAdmin())) return unauthorized();
  try {
    const db = getServiceClient();
    const { data, error } = await db.from('fields').select('*').order('name');
    if (error) return apiInternalError('Không thể tải lĩnh vực');
    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/admin/fields GET] Error:', error);
    return apiInternalError('Không thể tải lĩnh vực');
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) return unauthorized();

  let body: { slug?: string; name?: string; description?: string; icon?: string };
  try {
    body = await request.json();
  } catch {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!slug || !name) return apiBadRequest('Thiếu slug hoặc name');

  const db = getServiceClient();
  const { data, error } = await db
    .from('fields')
    .insert({ slug, name, description: body.description ?? null, icon: body.icon ?? null })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return apiConflict('Slug đã tồn tại');
    return apiInternalError('Không thể tạo lĩnh vực');
  }

  // Revalidate navigation and posts cache
  revalidatePath('/api/navigation');
  revalidatePath('/');
  revalidatePath('/posts');

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) return unauthorized();

  let body: { id?: string; slug?: string; name?: string; description?: string; icon?: string };
  try {
    body = await request.json();
  } catch {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  if (!body.id) return apiBadRequest('Thiếu id');

  const update: Database['public']['Tables']['fields']['Update'] = {};
  if (body.slug) update.slug = body.slug;
  if (body.name) update.name = body.name;
  if (body.description !== undefined) update.description = body.description ?? null;
  if (body.icon !== undefined) update.icon = body.icon ?? null;

  const db = getServiceClient();
  const { data, error } = await db
    .from('fields')
    .update(update)
    .eq('id', body.id)
    .select()
    .single();
  if (error) return apiInternalError('Không thể cập nhật lĩnh vực');

  // Revalidate navigation and posts cache
  revalidatePath('/api/navigation');
  revalidatePath('/');
  revalidatePath('/posts');

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) return unauthorized();

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return apiBadRequest('Thiếu id');

  const db = getServiceClient();
  const { error } = await db.from('fields').delete().eq('id', id);
  if (error) return apiInternalError('Không thể xóa lĩnh vực');

  // Revalidate navigation and posts cache
  revalidatePath('/api/navigation');
  revalidatePath('/');
  revalidatePath('/posts');

  return NextResponse.json({ ok: true });
}
