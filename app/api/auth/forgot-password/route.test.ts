import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as forgotPost } from './route';

// Mock Supabase auth - forgot-password now delegates to Supabase
vi.mock('@/lib/auth/supabase-auth', () => ({
  requestPasswordReset: vi.fn().mockResolvedValue(undefined),
}));

describe('forgot-password', () => {
  it('returns ok for any email (no account enumeration)', async () => {
    const res = await forgotPost(
      new NextRequest('http://localhost/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'anyone@example.com' }),
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    // No token leakage - Supabase sends email directly
    expect(json.devResetToken).toBeUndefined();
  });

  it('returns 400 for invalid email', async () => {
    const res = await forgotPost(
      new NextRequest('http://localhost/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email' }),
      })
    );
    expect(res.status).toBe(400);
  });

  it('returns ok even when Supabase throws (no account enumeration)', async () => {
    const { requestPasswordReset } = await import('@/lib/auth/supabase-auth');
    vi.mocked(requestPasswordReset).mockRejectedValueOnce(new Error('User not found'));

    const res = await forgotPost(
      new NextRequest('http://localhost/api/auth/forgot-password', {
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
    const res = await forgotPost(
      new NextRequest('http://localhost/api/auth/forgot-password', {
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
});
