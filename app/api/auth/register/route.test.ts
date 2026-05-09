import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as registerPost } from './route';

vi.mock('@/lib/auth/supabase-auth', () => ({
  registerUser: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  getClientIdentifier: vi.fn(),
}));

vi.mock('@/lib/auth/captcha', () => ({
  isCaptchaEnabled: vi.fn(() => false),
  verifyCaptchaToken: vi.fn(async () => true),
}));

describe('register route', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { checkRateLimit, getClientIdentifier } = await import('@/lib/rate-limit');
    vi.mocked(getClientIdentifier).mockReturnValue('127.0.0.1');
    vi.mocked(checkRateLimit).mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60000,
    });
  });

  it('returns 403 for cross-site request', async () => {
    const res = await registerPost(
      new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sec-fetch-site': 'cross-site',
        },
        body: JSON.stringify({
          email: 'a@example.com',
          password: 'StrongPass1!',
          full_name: 'Alice',
        }),
      })
    );
    expect(res.status).toBe(403);
  });

  it('returns indistinguishable success when email already exists', async () => {
    const { registerUser } = await import('@/lib/auth/supabase-auth');
    vi.mocked(registerUser).mockRejectedValueOnce(new Error('EMAIL_TAKEN'));

    const res = await registerPost(
      new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'exists@example.com',
          password: 'StrongPass1!',
          full_name: 'Existing User',
        }),
      })
    );

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('returns 400 when captcha verification fails', async () => {
    const { isCaptchaEnabled, verifyCaptchaToken } = await import('@/lib/auth/captcha');
    vi.mocked(isCaptchaEnabled).mockReturnValueOnce(true);
    vi.mocked(verifyCaptchaToken).mockResolvedValueOnce(false);

    const res = await registerPost(
      new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'captcha@example.com',
          password: 'StrongPass1!',
          full_name: 'Captcha User',
          captchaToken: 'bad-token',
        }),
      })
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error?.message).toContain('Xác minh bảo mật thất bại');
  });
});
