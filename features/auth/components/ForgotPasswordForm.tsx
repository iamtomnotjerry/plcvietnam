'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setDevToken(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        devResetToken?: string;
        message?: string;
      };
      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra');
        return;
      }
      setMessage(
        'Nếu email tồn tại trong hệ thống demo, bạn có thể đặt lại mật khẩu (xem hướng dẫn bên dưới trong môi trường dev).'
      );
      if (typeof data.devResetToken === 'string') {
        setDevToken(data.devResetToken);
      }
    } catch {
      setError('Không gửi được yêu cầu');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{message}</p>
      )}
      {devToken && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
          <p className="font-medium text-amber-900 dark:text-amber-100">Development only</p>
          <p className="mt-1 break-all font-mono text-xs">{devToken}</p>
          <Link
            href={`/auth/reset-password?token=${encodeURIComponent(devToken)}` as Route}
            className="mt-2 inline-block text-sm font-medium text-primary underline"
          >
            Mở trang đặt lại mật khẩu
          </Link>
        </div>
      )}
      <div>
        <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {loading ? 'Đang gửi…' : 'Gửi liên kết đặt lại (demo)'}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href={'/auth/sign-in' as Route} className="text-primary hover:underline">
          Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}
