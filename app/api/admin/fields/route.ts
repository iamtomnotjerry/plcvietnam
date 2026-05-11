/**
 * Admin Fields API - CRUD for fields (lĩnh vực)
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import type { Database } from '@/lib/supabase/database.types';
import { apiBadRequest, apiConflict, apiInternalError, apiUnauthorized } from '@/lib/api/responses';
import { requireAdminAuth } from '@/lib/auth/server-auth';
import { logAdminChecklogEvent } from '@/lib/checklog/log-admin-event';
import { logRouteError } from '@/lib/api/request-id';
import { HOMEPAGE_FIELDS_LIMIT } from '@/lib/data/pick-homepage-fields';

function unauthorized() {
  return apiUnauthorized();
}

async function countFeaturedOnHomeExcluding(
  db: ReturnType<typeof getServiceClient>,
  excludeId?: string
): Promise<number> {
  let q = db
    .from('fields')
    .select('id', { count: 'exact', head: true })
    .eq('featured_on_home', true);
  if (excludeId) q = q.neq('id', excludeId);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await requireAdminAuth())) return unauthorized();
  try {
    const db = getServiceClient();
    const { data, error } = await db.from('fields').select('*').order('name');
    if (error) return apiInternalError('Không thể tải lĩnh vực');
    return NextResponse.json(data);
  } catch (error) {
    logRouteError('[api/admin/fields GET]', request, error);
    return apiInternalError('Không thể tải lĩnh vực');
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (!auth) return unauthorized();

  let body: {
    slug?: string;
    name?: string;
    description?: string;
    icon?: string;
    featured_on_home?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!slug || !name) return apiBadRequest('Thiếu slug hoặc name');

  const wantFeatured = body.featured_on_home === true;
  const db = getServiceClient();
  if (wantFeatured) {
    const n = await countFeaturedOnHomeExcluding(db);
    if (n >= HOMEPAGE_FIELDS_LIMIT) {
      return apiBadRequest(
        `Đã đủ ${HOMEPAGE_FIELDS_LIMIT} lĩnh vực nổi bật trên trang chủ. Bỏ chọn một mục khác trước.`
      );
    }
  }

  const { data, error } = await db
    .from('fields')
    .insert({
      slug,
      name,
      description: body.description ?? null,
      icon: body.icon ?? null,
      featured_on_home: wantFeatured,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return apiConflict('Slug đã tồn tại');
    return apiInternalError('Không thể tạo lĩnh vực');
  }

  logAdminChecklogEvent({
    request,
    auth,
    channel: 'fields.create',
    outcome: 'success',
    metadata: { fieldId: data.id, slug },
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

  let body: {
    id?: string;
    slug?: string;
    name?: string;
    description?: string;
    icon?: string;
    featured_on_home?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  if (!body.id) return apiBadRequest('Thiếu id');

  const db = getServiceClient();

  if (body.featured_on_home === true) {
    const { data: current, error: curErr } = await db
      .from('fields')
      .select('featured_on_home')
      .eq('id', body.id)
      .single();
    if (curErr || !current) return apiBadRequest('Không tìm thấy lĩnh vực');
    if (!current.featured_on_home) {
      const n = await countFeaturedOnHomeExcluding(db, body.id);
      if (n >= HOMEPAGE_FIELDS_LIMIT) {
        return apiBadRequest(
          `Đã đủ ${HOMEPAGE_FIELDS_LIMIT} lĩnh vực nổi bật trên trang chủ. Bỏ chọn một mục khác trước.`
        );
      }
    }
  }

  const update: Database['public']['Tables']['fields']['Update'] = {};
  if (body.slug) update.slug = body.slug;
  if (body.name) update.name = body.name;
  if (body.description !== undefined) update.description = body.description ?? null;
  if (body.icon !== undefined) update.icon = body.icon ?? null;
  if (body.featured_on_home !== undefined) update.featured_on_home = Boolean(body.featured_on_home);

  const { data, error } = await db
    .from('fields')
    .update(update)
    .eq('id', body.id)
    .select()
    .single();
  if (error) return apiInternalError('Không thể cập nhật lĩnh vực');

  logAdminChecklogEvent({
    request,
    auth,
    channel: 'fields.update',
    outcome: 'success',
    metadata: { fieldId: body.id },
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
  const { error } = await db.from('fields').delete().eq('id', id);
  if (error) return apiInternalError('Không thể xóa lĩnh vực');

  logAdminChecklogEvent({
    request,
    auth,
    channel: 'fields.delete',
    outcome: 'success',
    metadata: { fieldId: id },
  });

  // Revalidate navigation and posts cache
  revalidatePath('/api/navigation');
  revalidatePath('/');
  revalidatePath('/posts');

  return NextResponse.json({ ok: true });
}
