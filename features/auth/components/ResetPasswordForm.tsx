'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import type { Route } from 'next';

function ResetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get('token')?.trim() ?? '';

  const [token, setToken] = useState(tokenFromQuery);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra');
        return;
      }
      router.push('/auth/sign-in?reset=1' as Route);
      router.refresh();
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
      <div>
        <label htmlFor="reset-token" className="mb-1 block text-sm font-medium">
          Token
        </label>
        <input
          id="reset-token"
          type="text"
          required
          value={token}
          onChange={e => setToken(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm"
          placeholder="Dán token từ email (demo: từ bước quên mật khẩu)"
        />
      </div>
      <div>
        <label htmlFor="reset-password" className="mb-1 block text-sm font-medium">
          Mật khẩu mới
        </label>
        <input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {loading ? 'Đang lưu…' : 'Đặt lại mật khẩu'}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href={'/auth/sign-in' as Route} className="text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
