import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { contentRepository } from '@/lib/data/factory';
import { UpdatePostSchema } from '@/lib/validation/schemas';
import { sanitizeHtml } from '@/lib/security/sanitize';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { ZodError } from 'zod';
import type { UpdatePostInput } from '@/lib/data/repository';

function unauthorized() {
  return NextResponse.json({ error: 'Không có quyền' }, { status: 401 });
}

async function requireEditor() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session?.user || (role !== 'admin' && role !== 'author')) return null;
  return session;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await requireEditor())) return unauthorized();
  const { id } = await context.params;
  const post = await contentRepository.getPostById(id);
  if (!post) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await requireEditor())) return unauthorized();

  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'api');
  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Quá nhiều yêu cầu' }, { status: 429 });
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  // Full Zod validation
  let validated;
  try {
    validated = UpdatePostSchema.parse(body);
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
    if (!post) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
    return NextResponse.json(post);
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'SLUG_TAKEN') {
        return NextResponse.json({ error: 'Slug đã tồn tại trong danh mục' }, { status: 409 });
      }
      if (e.message === 'INVALID_CATEGORY') {
        return NextResponse.json({ error: 'Danh mục không hợp lệ' }, { status: 400 });
      }
    }
    // Handle Postgres errors
    if (e && typeof e === 'object' && 'code' in e) {
      const pg = e as { code: string };
      if (pg.code === '23505') {
        return NextResponse.json({ error: 'Slug đã tồn tại' }, { status: 409 });
      }
    }
    console.error('[admin/posts/[id] PATCH]', e);
    return NextResponse.json({ error: 'Cập nhật thất bại' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await requireEditor())) return unauthorized();
  const { id } = await context.params;
  const ok = await contentRepository.deletePost(id);
  if (!ok) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
