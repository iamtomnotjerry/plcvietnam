/**
 * Admin Users API
 * List users and manage roles.
 * Requires admin role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import type { Database } from '@/lib/supabase/database.types';
import { apiBadRequest, apiInternalError, apiUnauthorized } from '@/lib/api/responses';
import { requireAdminAuth } from '@/lib/auth/server-auth';

type UserRole = Database['public']['Enums']['user_role'];

function unauthorized() {
  return apiUnauthorized();
}

/** GET /api/admin/users?page=&limit= */
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await requireAdminAuth())) return unauthorized();

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)));

  const db = getServiceClient();
  const { data, error, count } = await db
    .from('profiles')
    .select('id, email, full_name, role, avatar_url, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) return apiInternalError('Không thể tải danh sách người dùng');

  return NextResponse.json({
    data,
    pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
  });
}

/** PATCH /api/admin/users  body: { id, role } */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (!auth) return unauthorized();

  let body: { id?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  if (!body.id) return apiBadRequest('Thiếu id');

  const validRoles: UserRole[] = ['admin', 'author', 'reader'];
  if (!body.role || !validRoles.includes(body.role as UserRole)) {
    return apiBadRequest('Role không hợp lệ');
  }

  // Prevent admin from demoting themselves
  if (body.id === auth.userId && body.role !== 'admin') {
    return apiBadRequest('Không thể thay đổi role của chính mình');
  }

  const db = getServiceClient();
  const { data, error } = await db
    .from('profiles')
    .update({ role: body.role as UserRole })
    .eq('id', body.id)
    .select('id, email, full_name, role')
    .single();

  if (error) return apiInternalError('Không thể cập nhật role người dùng');
  return NextResponse.json(data);
}
