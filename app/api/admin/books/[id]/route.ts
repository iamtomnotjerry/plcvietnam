/**
 * Admin Books [id] API
 * GET    /api/admin/books/[id] - get one book
 * PATCH  /api/admin/books/[id] - update book
 * DELETE /api/admin/books/[id] - delete book
 *
 * ✅ Security: Zod validation, XSS protection, admin auth, rate limiting
 * ✅ Performance: Singleton Supabase client
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import { CreateBookSchema } from '@/lib/validation/schemas';
import { sanitizeHtml } from '@/lib/security/sanitize';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { ZodError } from 'zod';
import type { Database } from '@/lib/supabase/database.types';
import {
  apiBadRequest,
  apiConflict,
  apiInternalError,
  apiNotFound,
  apiTooManyRequests,
  apiUnauthorized,
} from '@/lib/api/responses';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return apiUnauthorized('Unauthorized');
  }

  const { id } = await params;
  const supabase = getServiceClient();
  const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
  if (error || !data) return apiNotFound('Not found');
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return apiUnauthorized('Unauthorized');
  }

  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'api');

  if (!rateLimit.success) {
    return apiTooManyRequests('Quá nhiều yêu cầu. Vui lòng thử lại sau.', rateLimit);
  }

  const { id } = await params;
  const body = await request.json();

  // Validate input
  let validated;
  try {
    validated = CreateBookSchema.partial().parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return apiBadRequest(firstError.message);
    }
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  // Build update payload — only map fields that exist in the books table schema
  type BookUpdate = Database['public']['Tables']['books']['Update'];
  const updateData: BookUpdate = {};
  if (validated.slug !== undefined) updateData.slug = validated.slug;
  if (validated.title !== undefined) updateData.title = validated.title;
  if (validated.description !== undefined)
    updateData.description = sanitizeHtml(validated.description ?? '');
  if (validated.cover_url !== undefined) updateData.cover_image_url = validated.cover_url ?? null;
  if (validated.download_url !== undefined)
    updateData.download_url = validated.download_url ?? null;
  updateData.updated_at = new Date().toISOString();

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('books')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    // Handle Postgres errors
    if (error.code === '23505') {
      return apiConflict('Slug đã tồn tại');
    }
    return apiInternalError('Không thể cập nhật sách');
  }

  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return apiUnauthorized('Unauthorized');
  }

  const { id } = await params;
  const supabase = getServiceClient();
  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) return apiInternalError('Không thể xóa sách');
  return NextResponse.json({ success: true });
}
