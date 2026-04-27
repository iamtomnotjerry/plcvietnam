/**
 * Admin Posts API - Production Grade
 * - Type-safe with Zod validation
 * - Proper error handling with Postgres error codes
 * - Rate limiting
 * - XSS protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { contentRepository } from '@/lib/data/factory';
import { CreatePostSchema, PaginationSchema } from '@/lib/validation/schemas';
import { sanitizeHtml } from '@/lib/security/sanitize';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { ZodError } from 'zod';
import type { AdminPostStatusFilter } from '@/lib/data/repository';

// Helper to check editor role
async function requireEditor() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session?.user || (role !== 'admin' && role !== 'author')) {
    return null;
  }
  return session;
}

function unauthorized() {
  return NextResponse.json({ error: 'Không có quyền' }, { status: 401 });
}

// ── GET: List Posts ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Check authentication
  if (!(await requireEditor())) return unauthorized();

  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'api');
  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Quá nhiều yêu cầu' }, { status: 429 });
  }

  // Parse and validate query params
  const { searchParams } = new URL(request.url);

  let pagination;
  try {
    pagination = PaginationSchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Tham số không hợp lệ', details: error.issues },
        { status: 400 }
      );
    }
  }

  const statusParam = searchParams.get('status');
  const status: AdminPostStatusFilter =
    statusParam === 'draft' || statusParam === 'published' || statusParam === 'all'
      ? statusParam
      : 'all';

  try {
    const result = await contentRepository.listPostsForAdmin({
      status,
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 50,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[admin/posts GET]', error);
    return NextResponse.json({ error: 'Không thể tải danh sách bài viết' }, { status: 500 });
  }
}

// ── POST: Create Post ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await requireEditor();
  if (!session) return unauthorized();

  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'api');
  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Quá nhiều yêu cầu' }, { status: 429 });
  }

  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  // Validate with Zod
  let validated;
  try {
    validated = CreatePostSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        {
          error: firstError.message,
          field: firstError.path.join('.'),
          details: error.issues,
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  // Sanitize HTML content to prevent XSS
  const sanitizedContent = sanitizeHtml(validated.content);
  const sanitizedExcerpt = validated.excerpt ? sanitizeHtml(validated.excerpt) : '';

  // Create post
  try {
    const post = await contentRepository.createPost({
      slug: validated.slug,
      title: validated.title,
      excerpt: sanitizedExcerpt,
      content: sanitizedContent,
      categoryId: validated.category_id,
      tagIds: validated.tag_ids || [],
      thumbnailUrl: validated.thumbnail_url,
      status: (validated.status || 'draft') as 'draft' | 'published',
      seo: {
        title: validated.meta_title || '',
        description: validated.meta_description || '',
        keywords: [],
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: unknown) {
    // Handle Postgres errors
    if (error && typeof error === 'object' && 'code' in error) {
      const pgError = error as { code: string; message: string };

      // Duplicate key (slug already exists)
      if (pgError.code === '23505') {
        if (pgError.message.includes('posts_slug_key')) {
          return NextResponse.json(
            { error: 'Slug đã tồn tại. Vui lòng chọn slug khác.' },
            { status: 409 }
          );
        }
      }

      // Foreign key violation (invalid category/tag)
      if (pgError.code === '23503') {
        if (pgError.message.includes('category_id')) {
          return NextResponse.json({ error: 'Danh mục không tồn tại' }, { status: 400 });
        }
        if (pgError.message.includes('tag')) {
          return NextResponse.json({ error: 'Tag không hợp lệ' }, { status: 400 });
        }
      }
    }

    console.error('[admin/posts POST]', error);
    return NextResponse.json({ error: 'Tạo bài viết thất bại' }, { status: 500 });
  }
}
