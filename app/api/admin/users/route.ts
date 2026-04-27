/**
 * Admin Users API
 * List users and manage roles.
 * Requires admin role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import type { Database } from '@/lib/supabase/database.types';

type UserRole = Database['public']['Enums']['user_role'];

function unauthorized() {
  return NextResponse.json({ error: 'Không có quyền' }, { status: 401 });
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') return null;
  return session;
}

/** GET /api/admin/users?page=&limit= */
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) return unauthorized();

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)));

  const db = getServiceClient();
  const { data, error, count } = await db
    .from('profiles')
    .select('id, email, full_name, role, avatar_url, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
  });
}

/** PATCH /api/admin/users  body: { id, role } */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  let body: { id?: string; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  if (!body.id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });

  const validRoles: UserRole[] = ['admin', 'author', 'reader'];
  if (!body.role || !validRoles.includes(body.role as UserRole)) {
    return NextResponse.json({ error: 'Role không hợp lệ' }, { status: 400 });
  }

  // Prevent admin from demoting themselves
  if (body.id === session.user.id && body.role !== 'admin') {
    return NextResponse.json({ error: 'Không thể thay đổi role của chính mình' }, { status: 400 });
  }

  const db = getServiceClient();
  const { data, error } = await db
    .from('profiles')
    .update({ role: body.role as UserRole })
    .eq('id', body.id)
    .select('id, email, full_name, role')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
