import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as resetPasswordPost } from './route';

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  getClientIdentifier: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('reset-password route', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { checkRateLimit, getClientIdentifier } = await import('@/lib/rate-limit');
    const { createClient } = await import('@/lib/supabase/server');

    vi.mocked(getClientIdentifier).mockReturnValue('127.0.0.1');
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
    });

    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
        updateUser: vi.fn().mockResolvedValue({ error: null }),
      },
    } as never);
  });

  it('returns 403 for cross-site request', async () => {
    const res = await resetPasswordPost(
      new NextRequest('http://localhost/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sec-fetch-site': 'cross-site',
        },
        body: JSON.stringify({
          password: 'StrongPass1',
          confirmPassword: 'StrongPass1',
        }),
      })
    );

    expect(res.status).toBe(403);
  });

  it('returns 400 when confirm password mismatches', async () => {
    const res = await resetPasswordPost(
      new NextRequest('http://localhost/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: 'StrongPass1',
          confirmPassword: 'StrongPass2',
        }),
      })
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error?.code).toBe('BAD_REQUEST');
  });

  it('returns specific message when new password equals old password', async () => {
    const { createClient } = await import('@/lib/supabase/server');
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
        updateUser: vi.fn().mockResolvedValue({
          error: {
            code: 'same_password',
            message: 'New password should be different from the old password.',
          },
        }),
      },
    } as never);

    const res = await resetPasswordPost(
      new NextRequest('http://localhost/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: 'StrongPass1!',
          confirmPassword: 'StrongPass1!',
        }),
      })
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error?.message).toBe('Mật khẩu mới không được trùng với mật khẩu cũ');
  });
});
