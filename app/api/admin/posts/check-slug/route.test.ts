import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

vi.mock('@/lib/auth/server-auth', () => ({
  requireEditorAuth: vi.fn(),
}));

const limitMock = vi.fn().mockResolvedValue({ data: [] });
const chain = {
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  limit: limitMock,
};
const selectMock = vi.fn(() => chain);

vi.mock('@/lib/supabase/client-singleton', () => ({
  getServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: selectMock,
    })),
  })),
}));

describe('GET /api/admin/posts/check-slug', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { requireEditorAuth } = await import('@/lib/auth/server-auth');
    vi.mocked(requireEditorAuth).mockResolvedValue({
      userId: 'u1',
      email: 'e@example.com',
      role: 'author',
    });
  });

  it('returns 401 without editor', async () => {
    const { requireEditorAuth } = await import('@/lib/auth/server-auth');
    vi.mocked(requireEditorAuth).mockResolvedValueOnce(null);
    const res = await GET(new NextRequest('http://localhost/api/admin/posts/check-slug?slug=a'));
    expect(res.status).toBe(401);
  });

  it('returns available false when slug empty', async () => {
    const res = await GET(new NextRequest('http://localhost/api/admin/posts/check-slug'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ available: false });
  });

  it('returns available true when no rows', async () => {
    const res = await GET(
      new NextRequest('http://localhost/api/admin/posts/check-slug?slug=new-slug')
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ available: true });
    expect(selectMock).toHaveBeenCalledWith('id');
    expect(limitMock).toHaveBeenCalledWith(1);
  });
});
