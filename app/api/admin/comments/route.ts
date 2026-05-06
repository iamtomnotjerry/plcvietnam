/**
 * Admin Comments API
 * List all comments (including pending) and approve/reject them.
 * Requires admin role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import {
  apiBadRequest,
  apiInternalError,
  apiTooManyRequests,
  apiUnauthorized,
} from '@/lib/api/responses';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

function unauthorized() {
  return apiUnauthorized();
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') return null;
  return session;
}

/** GET /api/admin/comments?postId=&approved=&page=&limit= */
export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) return unauthorized();
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'api');
  if (!rateLimit.success) {
    return apiTooManyRequests('Quá nhiều yêu cầu', rateLimit);
  }

  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');
  const approved = searchParams.get('approved');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)));

  const db = getServiceClient();
  let query = db
    .from('comments')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (postId) query = query.eq('post_id', postId);
  if (approved === 'true') query = query.eq('is_approved', true);
  if (approved === 'false') query = query.eq('is_approved', false);

  const { data, error, count } = await query;
  if (error) return apiInternalError('Không thể tải danh sách bình luận');

  return NextResponse.json({
    data,
    pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
  });
}

/** PATCH /api/admin/comments  body: { id, approved } */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) return unauthorized();
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'api');
  if (!rateLimit.success) {
    return apiTooManyRequests('Quá nhiều yêu cầu', rateLimit);
  }

  let body: { id?: string; approved?: boolean };
  try {
    body = await request.json();
  } catch {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  if (!body.id || typeof body.approved !== 'boolean') {
    return apiBadRequest('Thiếu id hoặc approved');
  }

  const db = getServiceClient();
  const { data, error } = await db
    .from('comments')
    .update({ is_approved: body.approved })
    .eq('id', body.id)
    .select()
    .single();

  if (error) return apiInternalError('Không thể cập nhật trạng thái bình luận');
  return NextResponse.json(data);
}

/** DELETE /api/admin/comments?id= */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) return unauthorized();
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'api');
  if (!rateLimit.success) {
    return apiTooManyRequests('Quá nhiều yêu cầu', rateLimit);
  }

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return apiBadRequest('Thiếu id');

  const db = getServiceClient();
  const { error } = await db.from('comments').delete().eq('id', id);
  if (error) return apiInternalError('Không thể xóa bình luận');
  return NextResponse.json({ ok: true });
}
