'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { resolveSafeCallbackPath } from '@/lib/auth/safe-callback';
import { TurnstileField } from '@/features/auth/components/TurnstileField';
import { AuthAlert } from '@/features/auth/components/AuthAlert';
import { isCaptchaConfigured } from '@/features/auth/captcha-config';
import { useAuthSubmit } from '@/features/auth/hooks/useAuthSubmit';
import { authInputClassName, authPrimaryButtonClassName } from '@/features/auth/form-classes';

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const registered = searchParams.get('registered') === '1';
  const resetOk = searchParams.get('reset') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const { submit, error, loading } = useAuthSubmit();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submit({
      url: '/api/auth/sign-in',
      body: { email: email.trim(), password, captchaToken },
      defaultErrorMessage: 'Đăng nhập thất bại. Vui lòng thử lại.',
    });
    if (!result.ok) return;

    const safe = resolveSafeCallbackPath(callbackUrl);
    router.push(safe as Route);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {registered && (
        <AuthAlert variant="success">
          Đăng ký thành công! Vui lòng kiểm tra email và click link xác nhận trước khi đăng nhập.
        </AuthAlert>
      )}
      {resetOk && (
        <AuthAlert variant="success">Đặt lại mật khẩu thành công. Vui lòng đăng nhập.</AuthAlert>
      )}
      {error && <AuthAlert variant="error">{error}</AuthAlert>}
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
          className={authInputClassName}
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
          className={authInputClassName}
        />
      </div>
      <button
        type="submit"
        disabled={loading || (isCaptchaConfigured && !captchaToken)}
        className={authPrimaryButtonClassName}
      >
        {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </button>
      <TurnstileField onTokenChange={setCaptchaToken} />
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
