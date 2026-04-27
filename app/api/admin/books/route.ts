/**
 * Admin Books API
 * GET  /api/admin/books - list all books
 * POST /api/admin/books - create a book
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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'api');
  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Quá nhiều yêu cầu' }, { status: 429 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('title', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'api');

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit?.toString() || '',
          'X-RateLimit-Remaining': rateLimit.remaining?.toString() || '',
          'X-RateLimit-Reset': rateLimit.reset?.toString() || '',
        },
      }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  // Validate input
  let validated;
  try {
    validated = CreateBookSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError.message, field: firstError.path.join('.'), details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
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
      return NextResponse.json({ error: 'Slug đã tồn tại' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
