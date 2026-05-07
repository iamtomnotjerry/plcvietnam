'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { resolveSafeCallbackPath } from '@/lib/auth/safe-callback';

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const registered = searchParams.get('registered') === '1';
  const resetOk = searchParams.get('reset') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: { message?: string } | string;
        };
        const message =
          typeof data.error === 'string'
            ? data.error
            : typeof data.error?.message === 'string'
              ? data.error.message
              : 'Đăng nhập thất bại. Vui lòng thử lại.';
        setError(message);
        return;
      }

      const safe = resolveSafeCallbackPath(callbackUrl);
      router.push(safe as Route);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {registered && (
        <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
          Đăng ký thành công! Vui lòng kiểm tra email và click link xác nhận trước khi đăng nhập.
        </p>
      )}
      {resetOk && (
        <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
          Đặt lại mật khẩu thành công. Vui lòng đăng nhập.
        </p>
      )}
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="signin-email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="signin-password" className="mb-1 block text-sm font-medium">
          Mật khẩu
        </label>
        <input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href={'/auth/forgot-password' as Route} className="text-primary hover:underline">
          Quên mật khẩu?
        </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{' '}
        <Link href={'/auth/sign-up' as Route} className="font-medium text-primary hover:underline">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
