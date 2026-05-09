'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { TurnstileField } from '@/features/auth/components/TurnstileField';
import { AuthAlert } from '@/features/auth/components/AuthAlert';
import { isCaptchaConfigured } from '@/features/auth/captcha-config';
import { useAuthSubmit } from '@/features/auth/hooks/useAuthSubmit';
import { authInputClassName, authPrimaryButtonClassName } from '@/features/auth/form-classes';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { submit, error, loading } = useAuthSubmit();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const result = await submit({
      url: '/api/auth/forgot-password',
      body: { email, captchaToken },
      defaultErrorMessage: 'Có lỗi xảy ra',
    });
    if (result.ok) {
      setMessage(
        'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.'
      );
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <AuthAlert variant="error">{error}</AuthAlert>}
      {message && <AuthAlert variant="info">{message}</AuthAlert>}
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
          onChange={(e) => setEmail(e.target.value)}
          className={authInputClassName}
        />
      </div>
      <button
        type="submit"
        disabled={loading || (isCaptchaConfigured && !captchaToken)}
        className={authPrimaryButtonClassName}
      >
        {loading ? 'Đang gửi…' : 'Gửi liên kết đặt lại '}
      </button>
      <TurnstileField onTokenChange={setCaptchaToken} />
      <p className="text-center text-sm text-muted-foreground">
        <Link href={'/auth/sign-in' as Route} className="text-primary hover:underline">
          Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}
