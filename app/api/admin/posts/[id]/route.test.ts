import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE, GET, PATCH } from './route';

vi.mock('@/lib/auth/server-auth', () => ({
  requireEditorAuth: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  getClientIdentifier: vi.fn(),
}));

vi.mock('@/lib/data/factory', () => ({
  contentRepository: {
    getPostById: vi.fn(),
    deletePost: vi.fn(),
    updatePost: vi.fn(),
  },
}));

vi.mock('@/lib/security/sanitize', () => ({
  sanitizeHtml: (html: string) => html,
}));

vi.mock('@/lib/checklog/log-admin-event', () => ({
  logAdminChecklogEvent: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe('GET /api/admin/posts/[id]', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { requireEditorAuth } = await import('@/lib/auth/server-auth');
    const { contentRepository } = await import('@/lib/data/factory');
    vi.mocked(requireEditorAuth).mockResolvedValue({
      userId: 'u1',
      email: 'e@example.com',
      role: 'author',
    });
    vi.mocked(contentRepository.getPostById).mockResolvedValue({
      id: 'post-1',
      slug: 's',
      title: 'T',
      excerpt: '',
      content: '<p></p>',
      categoryId: 'c1',
      authorId: 'a1',
      tags: [],
      publishedAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      readingTimeMinutes: 1,
      seo: { title: '', description: '', keywords: [] },
    } as never);
  });

  it('returns 401 without editor', async () => {
    const { requireEditorAuth } = await import('@/lib/auth/server-auth');
    vi.mocked(requireEditorAuth).mockResolvedValueOnce(null);
    const res = await GET(new NextRequest('http://localhost/api/admin/posts/x'), params('x'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when post missing', async () => {
    const { contentRepository } = await import('@/lib/data/factory');
    vi.mocked(contentRepository.getPostById).mockResolvedValueOnce(null);
    const res = await GET(
      new NextRequest('http://localhost/api/admin/posts/missing'),
      params('missing')
    );
    expect(res.status).toBe(404);
  });

  it('returns 200 with post json', async () => {
    const res = await GET(
      new NextRequest('http://localhost/api/admin/posts/post-1'),
      params('post-1')
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('post-1');
  });
});

describe('DELETE /api/admin/posts/[id]', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { requireEditorAuth } = await import('@/lib/auth/server-auth');
    const { contentRepository } = await import('@/lib/data/factory');
    vi.mocked(requireEditorAuth).mockResolvedValue({
      userId: 'u1',
      email: 'e@example.com',
      role: 'author',
    });
    vi.mocked(contentRepository.deletePost).mockResolvedValue(true);
  });

  it('returns 401 without editor', async () => {
    const { requireEditorAuth } = await import('@/lib/auth/server-auth');
    vi.mocked(requireEditorAuth).mockResolvedValueOnce(null);
    const res = await DELETE(new NextRequest('http://localhost/api/admin/posts/x'), params('x'));
    expect(res.status).toBe(401);
  });

  it('returns 404 when delete returns false', async () => {
    const { contentRepository } = await import('@/lib/data/factory');
    vi.mocked(contentRepository.deletePost).mockResolvedValueOnce(false);
    const res = await DELETE(
      new NextRequest('http://localhost/api/admin/posts/nope'),
      params('nope')
    );
    expect(res.status).toBe(404);
  });

  it('returns 200 when deleted', async () => {
    const res = await DELETE(new NextRequest('http://localhost/api/admin/posts/p1'), params('p1'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});

const samplePost = {
  id: 'post-1',
  slug: 's',
  title: 'Updated',
  excerpt: '',
  content: '<p></p>',
  categoryId: 'c1',
  authorId: 'a1',
  tags: [],
  publishedAt: new Date(),
  updatedAt: new Date(),
  viewCount: 0,
  readingTimeMinutes: 1,
  seo: { title: '', description: '', keywords: [] },
} as const;

function patchReq(body: unknown, headers?: Record<string, string>) {
  return new NextRequest('http://localhost/api/admin/posts/post-1', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

describe('PATCH /api/admin/posts/[id]', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { requireEditorAuth } = await import('@/lib/auth/server-auth');
    const { checkRateLimit, getClientIdentifier } = await import('@/lib/rate-limit');
    const { contentRepository } = await import('@/lib/data/factory');

    vi.mocked(requireEditorAuth).mockResolvedValue({
      userId: 'u1',
      email: 'e@example.com',
      role: 'author',
    });
    vi.mocked(getClientIdentifier).mockReturnValue('test-id');
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60_000,
    });
    vi.mocked(contentRepository.updatePost).mockResolvedValue(samplePost as never);
  });

  it('returns 401 without editor', async () => {
    const { requireEditorAuth } = await import('@/lib/auth/server-auth');
    vi.mocked(requireEditorAuth).mockResolvedValueOnce(null);
    const res = await PATCH(patchReq({ title: 'X' }), params('x'));
    expect(res.status).toBe(401);
  });

  it('returns 429 when rate limited', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      success: false,
      limit: 1,
      remaining: 0,
      reset: Date.now() + 60_000,
    });
    const res = await PATCH(patchReq({ title: 'X' }), params('post-1'));
    expect(res.status).toBe(429);
  });

  it('returns 400 on invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/admin/posts/post-1', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: 'not-json{',
    });
    const res = await PATCH(req, params('post-1'));
    expect(res.status).toBe(400);
  });

  it('returns 400 on Zod validation failure', async () => {
    const res = await PATCH(patchReq({ slug: 'Invalid Slug' }), params('post-1'));
    expect(res.status).toBe(400);
  });

  it('returns 404 when updatePost returns null', async () => {
    const { contentRepository } = await import('@/lib/data/factory');
    vi.mocked(contentRepository.updatePost).mockResolvedValueOnce(null);
    const res = await PATCH(patchReq({ title: 'N' }), params('post-1'));
    expect(res.status).toBe(404);
  });

  it('returns 200 and logs checklog on success', async () => {
    const { logAdminChecklogEvent } = await import('@/lib/checklog/log-admin-event');
    const res = await PATCH(patchReq({ title: 'New title' }), params('post-1'));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ id: 'post-1', title: 'Updated' });
    expect(logAdminChecklogEvent).toHaveBeenCalledWith(
      expect.objectContaining({ channel: 'posts.update', outcome: 'success' })
    );
  });

  it('returns 409 on SLUG_TAKEN', async () => {
    const { contentRepository } = await import('@/lib/data/factory');
    vi.mocked(contentRepository.updatePost).mockRejectedValueOnce(new Error('SLUG_TAKEN'));
    const res = await PATCH(patchReq({ slug: 'taken-slug' }), params('post-1'));
    expect(res.status).toBe(409);
  });

  it('returns 400 on INVALID_CATEGORY', async () => {
    const { contentRepository } = await import('@/lib/data/factory');
    vi.mocked(contentRepository.updatePost).mockRejectedValueOnce(new Error('INVALID_CATEGORY'));
    const res = await PATCH(
      patchReq({ category_id: '00000000-0000-4000-8000-000000000099' }),
      params('post-1')
    );
    expect(res.status).toBe(400);
  });

  it('returns 409 on Postgres 23505', async () => {
    const { contentRepository } = await import('@/lib/data/factory');
    vi.mocked(contentRepository.updatePost).mockRejectedValueOnce({ code: '23505' });
    const res = await PATCH(patchReq({ title: 'X' }), params('post-1'));
    expect(res.status).toBe(409);
  });

  it('returns 500 on unexpected errors', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { contentRepository } = await import('@/lib/data/factory');
    vi.mocked(contentRepository.updatePost).mockRejectedValueOnce(new Error('db-down'));
    const res = await PATCH(
      patchReq({ title: 'X' }, { 'x-request-id': 'trace-for-patch-123456' }),
      params('post-1')
    );
    expect(res.status).toBe(500);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
