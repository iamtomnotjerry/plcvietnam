/**
 * Comments API Route
 * Handles comment submission for authenticated users
 * Requirements: 4.5
 *
 * ✅ Security: Zod validation, XSS protection, rate limiting
 * ✅ Performance: Singleton Supabase client (via contentRepository)
 */

import { NextRequest, NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { CreateCommentSchema } from '@/lib/validation/schemas';
import { sanitizeHtml } from '@/lib/security/sanitize';
import { ZodError } from 'zod';
import { apiBadRequest, apiInternalError, apiUnauthorized } from '@/lib/api/responses';
import { createClient } from '@/lib/supabase/server';
import { recordChecklogEvent } from '@/lib/checklog/record-checklog-event';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/comments?postId=...
 * Returns comments for a post (public read).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const postId = request.nextUrl.searchParams.get('postId');
  if (!postId || typeof postId !== 'string') {
    return apiBadRequest('postId là bắt buộc');
  }

  try {
    const list = await contentRepository.getCommentsByPostId(postId);
    return NextResponse.json(list);
  } catch (error) {
    console.error('Failed to load comments:', error);
    return apiInternalError('Không thể tải bình luận');
  }
}

/**
 * POST /api/comments
 *
 * Accepts: { postId: string, content: string }
 * Returns: Created comment with 201 status
 *
 * Error responses:
 * - 401: Unauthenticated
 * - 400: Validation error (invalid content)
 * - 429: Rate limit exceeded
 * - 500: Server error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'comments');

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Quá nhiều bình luận. Vui lòng thử lại sau.',
        },
        retryAfter: rateLimit.reset,
      },
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

  // Check authentication via Supabase Auth session
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const authUser = authData.user;
  if (authError || !authUser) {
    return apiUnauthorized('Bạn cần đăng nhập để bình luận');
  }

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  // Validate with Zod
  let validated;
  try {
    validated = CreateCommentSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return apiBadRequest(firstError.message);
    }
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  // Sanitize HTML content
  const sanitizedContent = sanitizeHtml(validated.content);

  // Create comment
  try {
    const metadata = authUser.user_metadata ?? {};
    const userId = UUID_PATTERN.test(authUser.id) ? authUser.id : null;
    const userName =
      (typeof metadata.full_name === 'string' && metadata.full_name) ||
      (typeof metadata.name === 'string' && metadata.name) ||
      authUser.email ||
      'Anonymous';
    const userAvatar =
      (typeof metadata.avatar_url === 'string' && metadata.avatar_url) ||
      (typeof metadata.picture === 'string' && metadata.picture) ||
      undefined;

    const comment = await contentRepository.createComment({
      postId: validated.post_id,
      parentId: validated.parent_id ?? null,
      userId,
      userEmail: authUser.email ?? '',
      userName,
      userAvatar,
      content: sanitizedContent,
    });

    void recordChecklogEvent({
      category: 'content',
      channel: 'comments.create',
      source: 'server',
      http_method: 'POST',
      path: '/api/comments',
      actor_user_id: userId,
      ip: identifier,
      user_agent: request.headers.get('user-agent')?.slice(0, 512) ?? null,
      request_id: request.headers.get('x-request-id'),
      outcome: 'success',
      metadata: { postId: validated.post_id, commentId: comment.id },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return apiInternalError('Không thể lưu bình luận. Vui lòng thử lại.');
  }
}
