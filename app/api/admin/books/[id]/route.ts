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
import { getServiceClient } from '@/lib/supabase/client-singleton';
import { AdminBookPatchSchema } from '@/lib/validation/schemas';
import {
  countBooksFeaturedExcluding,
  featuredBooksCapErrorMessage,
} from '@/lib/api/admin-books-featured';
import { HOMEPAGE_FEATURED_BOOKS_LIMIT } from '@/lib/data/homepage-featured-books';
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
import { requireAdminAuth } from '@/lib/auth/server-auth';
import { logAdminChecklogEvent } from '@/lib/checklog/log-admin-event';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  if (!(await requireAdminAuth())) {
    return apiUnauthorized('Unauthorized');
  }

  const { id } = await params;
  const supabase = getServiceClient();
  const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
  if (error || !data) return apiNotFound('Not found');
  return NextResponse.json({ ...data, featured: data.featured === true });
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (!auth) {
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

  let validated;
  try {
    validated = AdminBookPatchSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return apiBadRequest(firstError.message);
    }
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  type BookUpdate = Database['public']['Tables']['books']['Update'];
  const updateData: BookUpdate = {};
  if (validated.slug !== undefined) updateData.slug = validated.slug;
  if (validated.title !== undefined) updateData.title = validated.title;
  if (validated.description !== undefined)
    updateData.description = sanitizeHtml(validated.description ?? '');
  if (validated.coverImageUrl !== undefined)
    updateData.cover_image_url = validated.coverImageUrl?.trim() || null;
  if (validated.authorName !== undefined)
    updateData.author_name = validated.authorName?.trim() || null;
  if (validated.series !== undefined) updateData.series = validated.series?.trim() || null;
  if (validated.volume !== undefined) updateData.volume = validated.volume;
  if (validated.publisher !== undefined) updateData.publisher = validated.publisher?.trim() || null;
  if (validated.publishedYear !== undefined) updateData.published_year = validated.publishedYear;
  if (validated.pages !== undefined) updateData.pages = validated.pages;
  if (validated.isbn !== undefined) updateData.isbn = validated.isbn?.trim() || null;
  if (validated.downloadUrl !== undefined)
    updateData.download_url = validated.downloadUrl?.trim() || null;
  if (validated.externalUrl !== undefined)
    updateData.amazon_url = validated.externalUrl?.trim() || null;
  if (validated.featured !== undefined) updateData.featured = validated.featured;
  updateData.updated_at = new Date().toISOString();

  const keysToWrite = Object.keys(updateData).filter((k) => k !== 'updated_at');
  if (keysToWrite.length === 0) {
    return apiBadRequest('Không có dữ liệu cập nhật');
  }

  const supabase = getServiceClient();

  if (validated.featured === true) {
    const { data: current, error: curErr } = await supabase
      .from('books')
      .select('featured')
      .eq('id', id)
      .single();
    if (curErr || !current) return apiNotFound('Không tìm thấy sách');
    if (!current.featured) {
      const n = await countBooksFeaturedExcluding(id);
      if (n >= HOMEPAGE_FEATURED_BOOKS_LIMIT) {
        return apiBadRequest(featuredBooksCapErrorMessage());
      }
    }
  }
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

  logAdminChecklogEvent({
    request,
    auth,
    channel: 'books.update',
    outcome: 'success',
    metadata: { bookId: id },
  });

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const auth = await requireAdminAuth();
  if (!auth) {
    return apiUnauthorized('Unauthorized');
  }

  const { id } = await params;
  const supabase = getServiceClient();
  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) return apiInternalError('Không thể xóa sách');

  logAdminChecklogEvent({
    request,
    auth,
    channel: 'books.delete',
    outcome: 'success',
    metadata: { bookId: id },
  });

  return NextResponse.json({ success: true });
}
