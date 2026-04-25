import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { contentRepository } from '@/lib/data/factory';
import type { UpdatePostInput } from '@/lib/data/repository';
import type { SEOMetadata } from '@/lib/types/domain';

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
  const { id } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const input: UpdatePostInput = {};
  if (typeof body.slug === 'string') input.slug = body.slug;
  if (typeof body.title === 'string') input.title = body.title;
  if (typeof body.excerpt === 'string') input.excerpt = body.excerpt;
  if (typeof body.content === 'string') input.content = body.content;
  if (typeof body.categoryId === 'string') input.categoryId = body.categoryId;
  if (Array.isArray(body.tagIds)) {
    input.tagIds = body.tagIds.filter((x): x is string => typeof x === 'string');
  }
  if (body.thumbnailUrl === null || typeof body.thumbnailUrl === 'string') {
    input.thumbnailUrl = body.thumbnailUrl as string | null;
  }
  if (body.status === 'draft' || body.status === 'published') input.status = body.status;
  if (body.seo && typeof body.seo === 'object') {
    input.seo = body.seo as Partial<SEOMetadata>;
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
    console.error(e);
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
