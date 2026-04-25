import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { contentRepository } from '@/lib/data/factory';
import type { CreatePostInput, AdminPostStatusFilter } from '@/lib/data/repository';
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

export async function GET(request: NextRequest) {
  if (!(await requireEditor())) return unauthorized();

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status');
  const status: AdminPostStatusFilter =
    statusParam === 'draft' || statusParam === 'published' || statusParam === 'all'
      ? statusParam
      : 'all';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50));

  const result = await contentRepository.listPostsForAdmin({ status, page, limit });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (!(await requireEditor())) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const slug = typeof body.slug === 'string' ? body.slug : '';
  const title = typeof body.title === 'string' ? body.title : '';
  const excerpt = typeof body.excerpt === 'string' ? body.excerpt : '';
  const content = typeof body.content === 'string' ? body.content : '';
  const categoryId = typeof body.categoryId === 'string' ? body.categoryId : '';
  const tagIds = Array.isArray(body.tagIds)
    ? body.tagIds.filter((id): id is string => typeof id === 'string')
    : [];
  const thumbnailUrl =
    typeof body.thumbnailUrl === 'string' && body.thumbnailUrl.trim()
      ? body.thumbnailUrl.trim()
      : undefined;
  const status = body.status === 'draft' ? 'draft' : 'published';
  const seoRaw = body.seo;
  const seo: SEOMetadata =
    seoRaw &&
    typeof seoRaw === 'object' &&
    typeof (seoRaw as SEOMetadata).title === 'string' &&
    typeof (seoRaw as SEOMetadata).description === 'string' &&
    Array.isArray((seoRaw as SEOMetadata).keywords)
      ? (seoRaw as SEOMetadata)
      : {
          title: title || slug,
          description: excerpt || title,
          keywords: [],
        };

  if (!slug.trim() || !title.trim() || !categoryId) {
    return NextResponse.json({ error: 'Thiếu slug, tiêu đề hoặc danh mục' }, { status: 400 });
  }

  const input: CreatePostInput = {
    slug,
    title,
    excerpt,
    content,
    categoryId,
    tagIds,
    thumbnailUrl,
    status,
    seo,
  };

  try {
    const post = await contentRepository.createPost(input);
    return NextResponse.json(post, { status: 201 });
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
    return NextResponse.json({ error: 'Tạo bài thất bại' }, { status: 500 });
  }
}
