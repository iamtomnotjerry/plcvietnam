/**
 * Comments API Route
 * Handles comment submission for authenticated users
 * Requirements: 4.5
 *
 * ✅ Security: Zod validation, XSS protection, rate limiting
 * ✅ Performance: Singleton Supabase client (via contentRepository)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { contentRepository } from '@/lib/data/factory';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { CreateCommentSchema } from '@/lib/validation/schemas';
import { sanitizeHtml } from '@/lib/security/sanitize';
import { ZodError } from 'zod';

/**
 * GET /api/comments?postId=...
 * Returns comments for a post (public read).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const postId = request.nextUrl.searchParams.get('postId');
  if (!postId || typeof postId !== 'string') {
    return NextResponse.json({ error: 'postId là bắt buộc' }, { status: 400 });
  }

  try {
    const list = await contentRepository.getCommentsByPostId(postId);
    return NextResponse.json(list);
  } catch (error) {
    console.error('Failed to load comments:', error);
    return NextResponse.json({ error: 'Không thể tải bình luận' }, { status: 500 });
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
        error: 'Quá nhiều bình luận. Vui lòng thử lại sau.',
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

  // Check authentication
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Bạn cần đăng nhập để bình luận' }, { status: 401 });
  }

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  // Validate with Zod
  let validated;
  try {
    validated = CreateCommentSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError.message, field: firstError.path.join('.') },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  // Sanitize HTML content
  const sanitizedContent = sanitizeHtml(validated.content);

  // Create comment
  try {
    const user = session.user as {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };

    const comment = await contentRepository.createComment({
      postId: validated.post_id,
      parentId: validated.parent_id ?? null,
      userId: user.id ?? user.email ?? 'unknown',
      userName: user.name ?? 'Anonymous',
      userAvatar: user.image ?? undefined,
      content: sanitizedContent,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Failed to create comment:', error);
    return NextResponse.json(
      { error: 'Không thể lưu bình luận. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}
