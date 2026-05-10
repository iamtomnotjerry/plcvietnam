import { NextRequest, NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';
import { UpdatePostSchema } from '@/lib/validation/schemas';
import { sanitizeHtml } from '@/lib/security/sanitize';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import type { UpdatePostInput } from '@/lib/data/repository';
import {
  apiBadRequest,
  apiConflict,
  apiInternalError,
  apiNotFound,
  apiTooManyRequests,
  apiUnauthorized,
} from '@/lib/api/responses';
import { requireEditorAuth } from '@/lib/auth/server-auth';
import { logAdminChecklogEvent } from '@/lib/checklog/log-admin-event';

function unauthorized() {
  return apiUnauthorized();
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await requireEditorAuth())) return unauthorized();
  const { id } = await context.params;
  const post = await contentRepository.getPostById(id);
  if (!post) return apiNotFound('Không tìm thấy');
  return NextResponse.json(post);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireEditorAuth();
  if (!auth) return unauthorized();

  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'api');
  if (!rateLimit.success) {
    return apiTooManyRequests('Quá nhiều yêu cầu');
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  // Full Zod validation
  let validated;
  try {
    validated = UpdatePostSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return apiBadRequest(firstError.message);
    }
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  // Build sanitized input
  const input: UpdatePostInput = {};
  if (validated.slug !== undefined) input.slug = validated.slug;
  if (validated.title !== undefined) input.title = validated.title;
  if (validated.excerpt !== undefined) input.excerpt = sanitizeHtml(validated.excerpt);
  if (validated.content !== undefined) input.content = sanitizeHtml(validated.content);
  if (validated.category_id !== undefined) input.categoryId = validated.category_id;
  if (validated.tag_ids !== undefined) input.tagIds = validated.tag_ids;
  if (validated.thumbnail_url !== undefined) input.thumbnailUrl = validated.thumbnail_url ?? null;
  if (validated.status !== undefined) input.status = validated.status as 'draft' | 'published';
  if (
    validated.meta_title !== undefined ||
    validated.meta_description !== undefined ||
    validated.meta_keywords !== undefined
  ) {
    input.seo = {
      title: validated.meta_title,
      description: validated.meta_description,
      keywords: validated.meta_keywords ?? [],
    };
  }

  try {
    const post = await contentRepository.updatePost(id, input);
    if (!post) return apiNotFound('Không tìm thấy');

    logAdminChecklogEvent({
      request,
      auth,
      channel: 'posts.update',
      outcome: 'success',
      metadata: { postId: id },
    });

    // Revalidate posts page and homepage
    revalidatePath('/posts');
    revalidatePath('/');

    return NextResponse.json(post);
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'SLUG_TAKEN') {
        return apiConflict('Slug đã tồn tại trong danh mục');
      }
      if (e.message === 'INVALID_CATEGORY') {
        return apiBadRequest('Danh mục không hợp lệ');
      }
    }
    // Handle Postgres errors
    if (e && typeof e === 'object' && 'code' in e) {
      const pg = e as { code: string };
      if (pg.code === '23505') {
        return apiConflict('Slug đã tồn tại');
      }
    }
    console.error('[admin/posts/[id] PATCH]', e);
    return apiInternalError('Cập nhật thất bại');
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireEditorAuth();
  if (!auth) return unauthorized();
  const { id } = await context.params;
  const ok = await contentRepository.deletePost(id);
  if (!ok) return apiNotFound('Không tìm thấy');

  logAdminChecklogEvent({
    request,
    auth,
    channel: 'posts.delete',
    outcome: 'success',
    metadata: { postId: id },
  });

  // Revalidate posts page and homepage
  revalidatePath('/posts');
  revalidatePath('/');

  return NextResponse.json({ ok: true });
}
