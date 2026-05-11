/**
 * Admin Posts API - Production Grade
 * - Type-safe with Zod validation
 * - Proper error handling with Postgres error codes
 * - Rate limiting
 * - XSS protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_POSTS_LIST_DEFAULT_PAGE_SIZE } from '@/lib/admin/constants';
import { contentRepository } from '@/lib/data/factory';
import { z } from 'zod';
import { CreatePostSchema } from '@/lib/validation/schemas';
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
import { requireEditorAuth } from '@/lib/auth/server-auth';
import { logAdminChecklogEvent } from '@/lib/checklog/log-admin-event';
import { logRouteError } from '@/lib/api/request-id';

// Helper to check editor role
function unauthorized() {
  return apiUnauthorized();
}

// ── GET: List Posts ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  // Check authentication
  if (!(await requireEditorAuth())) return unauthorized();

  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'api');
  if (!rateLimit.success) {
    return apiTooManyRequests('Quá nhiều yêu cầu');
  }

  // Parse and validate query params
  const { searchParams } = new URL(request.url);

  const statusParam = searchParams.get('status');
  const status: AdminPostStatusFilter =
    statusParam === 'draft' || statusParam === 'published' || statusParam === 'all'
      ? statusParam
      : 'all';

  const qRaw = searchParams.get('q')?.trim();
  const search = qRaw && qRaw.length <= 200 ? qRaw : undefined;

  const categoryRaw = searchParams.get('category_id')?.trim();
  let categoryId: string | undefined;
  if (categoryRaw) {
    // UUID (prod) or short stable ids (mock / fixtures); reject odd characters.
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(categoryRaw)) {
      return apiBadRequest('category_id không hợp lệ');
    }
    categoryId = categoryRaw;
  }

  const forReorder = searchParams.get('for_reorder') === '1';
  if (forReorder && !categoryId) {
    return apiBadRequest('for_reorder cần category_id');
  }
  const maxLimit = forReorder && categoryId ? 500 : 100;

  let pagination;
  try {
    // Default limit 10 when omitted — aligned with `/admin/posts` list UI and `current-system-state.md`.
    pagination = z
      .object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce
          .number()
          .int()
          .min(1)
          .max(maxLimit)
          .default(ADMIN_POSTS_LIST_DEFAULT_PAGE_SIZE),
      })
      .parse({
        page: searchParams.get('page') || undefined,
        limit: searchParams.get('limit') ?? String(ADMIN_POSTS_LIST_DEFAULT_PAGE_SIZE),
      });
  } catch {
    return apiBadRequest('Tham số không hợp lệ');
  }

  try {
    const result = await contentRepository.listPostsForAdmin({
      status,
      page: pagination.page,
      limit: pagination.limit,
      search,
      categoryId,
    });
    return NextResponse.json(result);
  } catch (error) {
    logRouteError('[admin/posts GET]', request, error);
    return apiInternalError('Không thể tải danh sách bài viết');
  }
}

// ── POST: Create Post ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const auth = await requireEditorAuth();
  if (!auth) return unauthorized();

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

    logAdminChecklogEvent({
      request,
      auth,
      channel: 'posts.create',
      outcome: 'success',
      metadata: { postId: post.id, slug: post.slug },
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

    logRouteError('[admin/posts POST]', request, error);
    return apiInternalError('Tạo bài viết thất bại');
  }
}
