import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/auth/server-auth', () => ({
  requireAuthenticatedAuth: vi.fn(),
}));

describe('GET /api/admin/me', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { requireAuthenticatedAuth } = await import('@/lib/auth/server-auth');
    vi.mocked(requireAuthenticatedAuth).mockResolvedValue({
      userId: 'u1',
      email: 'a@example.com',
      role: 'author',
    });
  });

  it('returns 401 when unauthenticated', async () => {
    const { requireAuthenticatedAuth } = await import('@/lib/auth/server-auth');
    vi.mocked(requireAuthenticatedAuth).mockResolvedValueOnce(null);

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns role JSON when authenticated', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ role: 'author' });
  });
});
