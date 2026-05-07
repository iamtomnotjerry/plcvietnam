'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { supabase } from '@/lib/supabase/client';

function getPasswordChecks(password: string, confirmPassword: string) {
  return [
    { label: 'Ít nhất 8 ký tự', passed: password.length >= 8 },
    { label: 'Có ít nhất 1 chữ hoa', passed: /[A-Z]/.test(password) },
    { label: 'Có ít nhất 1 chữ thường', passed: /[a-z]/.test(password) },
    { label: 'Có ít nhất 1 số', passed: /[0-9]/.test(password) },
    { label: 'Có ít nhất 1 ký tự đặc biệt', passed: /[^A-Za-z0-9]/.test(password) },
    {
      label: 'Mật khẩu xác nhận khớp',
      passed: confirmPassword.length > 0 && password === confirmPassword,
    },
  ];
}

function ResetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenError = searchParams.get('error')?.trim();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordChecks = getPasswordChecks(password, confirmPassword);

  useEffect(() => {
    async function bootstrapResetSession() {
      const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
      if (!hash) {
        setIsSessionReady(true);
        return;
      }

      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (!accessToken || !refreshToken || type !== 'recovery') {
        setIsSessionReady(true);
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        setError('Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
      }

      // Remove sensitive tokens from URL after bootstrapping.
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setIsSessionReady(true);
    }

    void bootstrapResetSession();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSessionReady) {
      setError('Đang xác thực phiên đặt lại mật khẩu. Vui lòng thử lại sau vài giây.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: { message?: string } | string };
      if (!res.ok) {
        const message =
          typeof data.error === 'string'
            ? data.error
            : typeof data.error?.message === 'string'
              ? data.error.message
              : 'Có lỗi xảy ra';
        setError(message);
        return;
      }
      await supabase.auth.signOut();
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
      {tokenError && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
        </p>
      )}
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
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
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2">
        <p className="mb-1 text-xs font-medium text-muted-foreground">Yêu cầu mật khẩu</p>
        <ul className="space-y-1 text-xs">
          {passwordChecks.map((item) => (
            <li
              key={item.label}
              className={
                item.passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
              }
            >
              {item.passed ? '✓' : '•'} {item.label}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <label htmlFor="reset-confirm-password" className="mb-1 block text-sm font-medium">
          Xác nhận mật khẩu mới
        </label>
        <input
          id="reset-confirm-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !isSessionReady}
        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {loading ? 'Đang lưu…' : !isSessionReady ? 'Đang xác thực phiên…' : 'Đặt lại mật khẩu'}
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
