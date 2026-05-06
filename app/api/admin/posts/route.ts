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
import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import type { AdminPostStatusFilter } from '@/lib/data/repository';
import {
  apiBadRequest,
  apiConflict,
  apiInternalError,
  apiTooManyRequests,
  apiUnauthorized,
} from '@/lib/api/responses';

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
  return apiUnauthorized();
}

// ── GET: List Posts ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Check authentication
  if (!(await requireEditor())) return unauthorized();

  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'api');
  if (!rateLimit.success) {
    return apiTooManyRequests('Quá nhiều yêu cầu');
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
      return apiBadRequest('Tham số không hợp lệ');
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
    return apiInternalError('Không thể tải danh sách bài viết');
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
    return apiTooManyRequests('Quá nhiều yêu cầu');
  }

  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  // Validate with Zod
  let validated;
  try {
    validated = CreatePostSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return apiBadRequest(firstError.message);
    }
    return apiBadRequest('Dữ liệu không hợp lệ');
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
        keywords: validated.meta_keywords || [],
      },
    });

    // Revalidate posts page and homepage
    revalidatePath('/posts');
    revalidatePath('/');

    return NextResponse.json(post, { status: 201 });
  } catch (error: unknown) {
    // Handle Postgres errors
    if (error && typeof error === 'object' && 'code' in error) {
      const pgError = error as { code: string; message: string };

      // Duplicate key (slug already exists)
      if (pgError.code === '23505') {
        if (pgError.message.includes('posts_slug_key')) {
          return apiConflict('Slug đã tồn tại. Vui lòng chọn slug khác.');
        }
      }

      // Foreign key violation (invalid category/tag)
      if (pgError.code === '23503') {
        if (pgError.message.includes('category_id')) {
          return apiBadRequest('Danh mục không tồn tại');
        }
        if (pgError.message.includes('tag')) {
          return apiBadRequest('Tag không hợp lệ');
        }
      }
    }

    console.error('[admin/posts POST]', error);
    return apiInternalError('Tạo bài viết thất bại');
  }
}
