'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { supabase } from '@/lib/supabase/client';
import { AuthAlert } from '@/features/auth/components/AuthAlert';
import { PasswordChecklist } from '@/features/auth/components/PasswordChecklist';
import { useAuthSubmit } from '@/features/auth/hooks/useAuthSubmit';
import { authInputClassName, authPrimaryButtonClassName } from '@/features/auth/form-classes';

function ResetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenError = searchParams.get('error')?.trim();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSessionReady, setIsSessionReady] = useState(false);

  const { submit, error, loading, setError } = useAuthSubmit();

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
  }, [setError]);

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

    const result = await submit({
      url: '/api/auth/reset-password',
      body: { password, confirmPassword },
      defaultErrorMessage: 'Có lỗi xảy ra',
    });
    if (!result.ok) return;

    await supabase.auth.signOut();
    router.push('/auth/sign-in?reset=1' as Route);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {tokenError && (
        <AuthAlert variant="error">Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.</AuthAlert>
      )}
      {error && <AuthAlert variant="error">{error}</AuthAlert>}
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
          className={authInputClassName}
        />
      </div>
      <PasswordChecklist password={password} confirmPassword={confirmPassword} />
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
          className={authInputClassName}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !isSessionReady}
        className={authPrimaryButtonClassName}
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
    <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted/80" />}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
