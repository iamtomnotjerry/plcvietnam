/**
 * Comments API Route
 * Handles comment submission for authenticated users
 * Requirements: 4.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { validateComment } from '@/features/comments/utils/validation';
import { contentRepository } from '@/lib/data/factory';
import { checkRateLimit, getClientIdentifier, rateLimiters } from '@/lib/rate-limit';

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
 * - 500: Server error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, rateLimiters.comments);

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
  let body: { postId?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const { postId, content } = body;

  // Validate required fields
  if (!postId || typeof postId !== 'string') {
    return NextResponse.json({ error: 'postId là bắt buộc' }, { status: 400 });
  }

  if (typeof content !== 'string') {
    return NextResponse.json({ error: 'Nội dung bình luận là bắt buộc' }, { status: 400 });
  }

  // Validate comment content
  const validation = validateComment(content);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Create comment
  try {
    const user = session.user as {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };

    const comment = await contentRepository.createComment({
      postId,
      userId: user.id ?? user.email ?? 'unknown',
      userName: user.name ?? 'Anonymous',
      userAvatar: user.image ?? undefined,
      content,
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
