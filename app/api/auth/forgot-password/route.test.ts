import { describe, it, expect, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as forgotPost } from './route';
import { POST as resetPost } from '../reset-password/route';
import { updateMockUserPassword } from '@/lib/auth/mockUserStore';

describe('forgot-password + reset-password (mock)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    try {
      updateMockUserPassword('editor@demo.local', 'demo123');
    } catch {
      /* ignore */
    }
  });

  it('returns ok without leaking token for unknown user', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const res = await forgotPost(
      new NextRequest('http://localhost/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nobody@example.com' }),
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.devResetToken).toBeUndefined();
  });

  it('in development returns devResetToken and reset-password works (editor seed)', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const res = await forgotPost(
      new NextRequest('http://localhost/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'editor@demo.local' }),
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(typeof json.devResetToken).toBe('string');
    expect(json.devResetToken.length).toBeGreaterThan(10);

    const reset = await resetPost(
      new NextRequest('http://localhost/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: json.devResetToken, password: 'newpass123' }),
      })
    );
    expect(reset.status).toBe(200);
  });
});
