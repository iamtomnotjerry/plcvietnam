'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { TurnstileField } from '@/features/auth/components/TurnstileField';
import { AuthAlert } from '@/features/auth/components/AuthAlert';
import {
  PasswordChecklist,
  isPasswordChecklistValid,
} from '@/features/auth/components/PasswordChecklist';
import { isCaptchaConfigured } from '@/features/auth/captcha-config';
import { useAuthSubmit } from '@/features/auth/hooks/useAuthSubmit';
import { authInputClassName, authPrimaryButtonClassName } from '@/features/auth/form-classes';

export function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const passwordValid = isPasswordChecklistValid(password, confirmPassword);

  const { submit, error, loading, setError } = useAuthSubmit();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) {
      setError('Mật khẩu chưa đáp ứng đủ tiêu chí.');
      return;
    }
    const result = await submit({
      url: '/api/auth/register',
      body: { full_name: name, email, password, captchaToken },
      defaultErrorMessage: 'Đăng ký thất bại',
    });
    if (result.ok) setRegistered(true);
  };

  if (registered) {
    return (
      <div className="space-y-4 rounded-2xl border border-primary/15 bg-primary/[0.06] p-6 text-center dark:bg-primary/[0.08]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="w-6 h-6 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground">Kiểm tra email của bạn</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Chúng tôi đã gửi email xác nhận đến{' '}
          <span className="font-medium text-foreground">{email}</span>. Vui lòng click vào link
          trong email để kích hoạt tài khoản, sau đó đăng nhập.
        </p>
        <Link
          href={'/auth/sign-in' as Route}
          className={`inline-block w-full text-center ${authPrimaryButtonClassName}`}
        >
          Đến trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <AuthAlert variant="error">{error}</AuthAlert>}
      <div>
        <label htmlFor="signup-name" className="mb-1 block text-sm font-medium">
          Tên hiển thị
        </label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={authInputClassName}
        />
      </div>
      <div>
        <label htmlFor="signup-email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authInputClassName}
        />
      </div>
      <div>
        <label htmlFor="signup-password" className="mb-1 block text-sm font-medium">
          Mật khẩu
        </label>
        <input
          id="signup-password"
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
        <label htmlFor="signup-confirm-password" className="mb-1 block text-sm font-medium">
          Xác nhận mật khẩu
        </label>
        <input
          id="signup-confirm-password"
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
        disabled={loading || !passwordValid || (isCaptchaConfigured && !captchaToken)}
        className={authPrimaryButtonClassName}
      >
        {loading ? 'Đang tạo tài khoản…' : 'Đăng ký'}
      </button>
      <TurnstileField onTokenChange={setCaptchaToken} />
      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{' '}
        <Link href={'/auth/sign-in' as Route} className="font-medium text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
