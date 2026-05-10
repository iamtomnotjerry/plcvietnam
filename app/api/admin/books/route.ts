/**
 * Admin Books API
 * GET  /api/admin/books - list all books
 * POST /api/admin/books - create a book
 *
 * ✅ Security: Zod validation, XSS protection, admin auth, rate limiting
 * ✅ Performance: Singleton Supabase client
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import { AdminBookBodySchema } from '@/lib/validation/schemas';
import {
  countBooksFeaturedExcluding,
  featuredBooksCapErrorMessage,
} from '@/lib/api/admin-books-featured';
import { HOMEPAGE_FEATURED_BOOKS_LIMIT } from '@/lib/data/homepage-featured-books';
import { sanitizeHtml } from '@/lib/security/sanitize';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { ZodError } from 'zod';
import {
  apiBadRequest,
  apiConflict,
  apiInternalError,
  apiTooManyRequests,
  apiUnauthorized,
} from '@/lib/api/responses';
import { requireAdminAuth } from '@/lib/auth/server-auth';
import { logAdminChecklogEvent } from '@/lib/checklog/log-admin-event';

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await requireAdminAuth())) {
    return apiUnauthorized('Unauthorized');
  }

  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'api');
  if (!rateLimit.success) {
    return apiTooManyRequests('Quá nhiều yêu cầu');
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('title', { ascending: true });

  if (error) return apiInternalError('Không thể tải danh sách sách');
  const rows = data ?? [];
  return NextResponse.json(
    rows.map((row) => ({
      ...row,
      featured: row.featured === true,
    }))
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
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

  const body = await request.json().catch(() => null);
  if (!body) {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  let validated;
  try {
    validated = AdminBookBodySchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return apiBadRequest(firstError.message);
    }
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  const wantFeatured = validated.featured === true;
  const supabase = getServiceClient();
  if (wantFeatured) {
    const n = await countBooksFeaturedExcluding();
    if (n >= HOMEPAGE_FEATURED_BOOKS_LIMIT) {
      return apiBadRequest(featuredBooksCapErrorMessage());
    }
  }

  const sanitizedDescription = validated.description ? sanitizeHtml(validated.description) : null;

  const { data, error } = await supabase
    .from('books')
    .insert({
      slug: validated.slug,
      title: validated.title,
      description: sanitizedDescription,
      cover_image_url: validated.coverImageUrl?.trim() || null,
      download_url: validated.downloadUrl?.trim() || null,
      author_name: validated.authorName?.trim() || null,
      series: validated.series?.trim() || null,
      volume: validated.volume ?? null,
      publisher: validated.publisher?.trim() || null,
      published_year: validated.publishedYear ?? null,
      pages: validated.pages ?? null,
      isbn: validated.isbn?.trim() || null,
      amazon_url: validated.externalUrl?.trim() || null,
      featured: wantFeatured,
      field_id: null,
    })
    .select()
    .single();

  if (error) {
    // Handle Postgres errors
    if (error.code === '23505') {
      return apiConflict('Slug đã tồn tại');
    }
    return apiInternalError('Không thể tạo sách');
  }

  logAdminChecklogEvent({
    request,
    auth,
    channel: 'books.create',
    outcome: 'success',
    metadata: { bookId: data.id, slug: data.slug },
  });

  return NextResponse.json(data, { status: 201 });
}
