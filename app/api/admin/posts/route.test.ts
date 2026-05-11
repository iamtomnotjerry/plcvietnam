import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { ADMIN_POSTS_LIST_DEFAULT_PAGE_SIZE } from '@/lib/admin/constants';
import { GET } from './route';

vi.mock('@/lib/auth/server-auth', () => ({
  requireEditorAuth: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  getClientIdentifier: vi.fn(),
}));

vi.mock('@/lib/data/factory', () => ({
  contentRepository: {
    listPostsForAdmin: vi.fn(),
  },
}));

describe('GET /api/admin/posts', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { requireEditorAuth } = await import('@/lib/auth/server-auth');
    const { checkRateLimit, getClientIdentifier } = await import('@/lib/rate-limit');
    const { contentRepository } = await import('@/lib/data/factory');

    vi.mocked(requireEditorAuth).mockResolvedValue({
      userId: 'user-1',
      email: 'editor@example.com',
      role: 'admin',
    });
    vi.mocked(getClientIdentifier).mockReturnValue('test-id');
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60_000,
    });
    vi.mocked(contentRepository.listPostsForAdmin).mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        limit: ADMIN_POSTS_LIST_DEFAULT_PAGE_SIZE,
        total: 0,
        totalPages: 0,
      },
    });
  });

  it('returns 401 when requireEditorAuth is null', async () => {
    const { requireEditorAuth } = await import('@/lib/auth/server-auth');
    vi.mocked(requireEditorAuth).mockResolvedValueOnce(null);

    const res = await GET(new NextRequest('http://localhost/api/admin/posts'));
    expect(res.status).toBe(401);
  });

  it('calls listPostsForAdmin with default limit when limit query omitted', async () => {
    const { contentRepository } = await import('@/lib/data/factory');

    const res = await GET(new NextRequest('http://localhost/api/admin/posts'));
    expect(res.status).toBe(200);

    expect(contentRepository.listPostsForAdmin).toHaveBeenCalledWith({
      status: 'all',
      page: 1,
      limit: ADMIN_POSTS_LIST_DEFAULT_PAGE_SIZE,
      search: undefined,
    });
  });

  it('passes status and search query when provided', async () => {
    const { contentRepository } = await import('@/lib/data/factory');

    await GET(
      new NextRequest('http://localhost/api/admin/posts?status=draft&q=plc&page=2&limit=20')
    );

    expect(contentRepository.listPostsForAdmin).toHaveBeenCalledWith({
      status: 'draft',
      page: 2,
      limit: 20,
      search: 'plc',
    });
  });

  it('returns 400 when pagination params invalid', async () => {
    const res = await GET(new NextRequest('http://localhost/api/admin/posts?page=0'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when category_id has invalid characters', async () => {
    const res = await GET(new NextRequest('http://localhost/api/admin/posts?category_id=bad%20id'));
    expect(res.status).toBe(400);
  });

  it('passes category_id to repository when valid', async () => {
    const { contentRepository } = await import('@/lib/data/factory');
    await GET(new NextRequest('http://localhost/api/admin/posts?category_id=cat-1'));
    expect(contentRepository.listPostsForAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 'cat-1' })
    );
  });

  it('returns 400 when for_reorder=1 without category_id', async () => {
    const res = await GET(new NextRequest('http://localhost/api/admin/posts?for_reorder=1'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when limit exceeds 100 without for_reorder', async () => {
    const res = await GET(
      new NextRequest('http://localhost/api/admin/posts?limit=101&category_id=cat-1')
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when for_reorder limit exceeds 500', async () => {
    const res = await GET(
      new NextRequest('http://localhost/api/admin/posts?category_id=cat-1&for_reorder=1&limit=501')
    );
    expect(res.status).toBe(400);
  });

  it('allows limit 500 when for_reorder=1 and category_id', async () => {
    const { contentRepository } = await import('@/lib/data/factory');
    await GET(
      new NextRequest('http://localhost/api/admin/posts?category_id=cat-1&for_reorder=1&limit=500')
    );
    expect(contentRepository.listPostsForAdmin).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 'cat-1', limit: 500 })
    );
  });
});
