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
import { CreateBookSchema } from '@/lib/validation/schemas';
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
  return NextResponse.json(data ?? []);
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

  // Validate input
  let validated;
  try {
    validated = CreateBookSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return apiBadRequest(firstError.message);
    }
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  // Sanitize HTML content
  const sanitizedDescription = validated.description ? sanitizeHtml(validated.description) : null;

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('books')
    .insert({
      slug: validated.slug,
      title: validated.title,
      description: sanitizedDescription,
      cover_image_url: validated.cover_url ?? null,
      download_url: validated.download_url ?? null,
      author_name: null,
      field_id: null,
      amazon_url: null,
      isbn: null,
      publisher: null,
      published_year: null,
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
