import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

vi.mock('@/lib/auth/server-auth', () => ({
  requireAdminAuth: vi.fn(),
}));

const rangeMock = vi.fn().mockResolvedValue({
  data: [
    {
      id: 'u1',
      email: 'a@b.com',
      full_name: 'A',
      role: 'reader',
      avatar_url: null,
      created_at: 't',
    },
  ],
  error: null,
  count: 1,
});

vi.mock('@/lib/supabase/client-singleton', () => ({
  getServiceClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: rangeMock,
    })),
  })),
}));

describe('GET /api/admin/users', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { requireAdminAuth } = await import('@/lib/auth/server-auth');
    vi.mocked(requireAdminAuth).mockResolvedValue({
      userId: 'admin-1',
      email: 'admin@example.com',
      role: 'admin',
    });
  });

  it('returns 401 when not admin', async () => {
    const { requireAdminAuth } = await import('@/lib/auth/server-auth');
    vi.mocked(requireAdminAuth).mockResolvedValueOnce(null);
    const res = await GET(new NextRequest('http://localhost/api/admin/users'));
    expect(res.status).toBe(401);
  });

  it('returns paginated json', async () => {
    const res = await GET(new NextRequest('http://localhost/api/admin/users?page=1&limit=10'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.pagination).toMatchObject({ page: 1, limit: 10, total: 1 });
    expect(rangeMock).toHaveBeenCalledWith(0, 9);
  });
});
