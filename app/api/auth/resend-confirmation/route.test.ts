import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as resendPost } from './route';

vi.mock('@/lib/auth/supabase-auth', () => ({
  resendSignupConfirmation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  getClientIdentifier: vi.fn(),
}));

vi.mock('@/lib/auth/captcha', () => ({
  isCaptchaEnabled: vi.fn(() => false),
  verifyCaptchaToken: vi.fn(async () => true),
}));

describe('resend-confirmation', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { checkRateLimit, getClientIdentifier } = await import('@/lib/rate-limit');
    vi.mocked(getClientIdentifier).mockReturnValue('127.0.0.1');
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 60000,
    });
  });

  it('returns ok for any email (no account enumeration)', async () => {
    const res = await resendPost(
      new NextRequest('http://localhost/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'anyone@example.com' }),
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it('returns 400 for invalid email', async () => {
    const res = await resendPost(
      new NextRequest('http://localhost/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email' }),
      })
    );
    expect(res.status).toBe(400);
  });

  it('returns ok even when Supabase throws (no account enumeration)', async () => {
    const { resendSignupConfirmation } = await import('@/lib/auth/supabase-auth');
    vi.mocked(resendSignupConfirmation).mockRejectedValueOnce(new Error('not found'));

    const res = await resendPost(
      new NextRequest('http://localhost/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'unknown@example.com' }),
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it('returns 403 for cross-site request', async () => {
    const res = await resendPost(
      new NextRequest('http://localhost/api/auth/resend-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sec-fetch-site': 'cross-site',
        },
        body: JSON.stringify({ email: 'user@example.com' }),
      })
    );

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error?.code).toBe('FORBIDDEN');
  });

  it('returns 429 when resend cooldown is active', async () => {
    const { checkRateLimit } = await import('@/lib/rate-limit');
    vi.mocked(checkRateLimit).mockImplementation(async (_id, type) => {
      if (type === 'forgotResend') {
        return { success: false, limit: 1, remaining: 0, reset: Date.now() + 60000 };
      }
      return { success: true, limit: 10, remaining: 9, reset: Date.now() + 60000 };
    });

    const res = await resendPost(
      new NextRequest('http://localhost/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com' }),
      })
    );

    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error?.message).toContain('60 giây');
  });
});
