'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { TurnstileField } from '@/features/auth/components/TurnstileField';

export function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, email, password, captchaToken }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: { message?: string } | string;
      };
      if (!res.ok) {
        const message =
          typeof data.error === 'string'
            ? data.error
            : typeof data.error?.message === 'string'
              ? data.error.message
              : 'Đăng ký thất bại';
        setError(message);
        return;
      }
      setRegistered(true);
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
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
          className="inline-block w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground text-center"
        >
          Đến trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
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
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
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
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="signup-password" className="mb-1 block text-sm font-medium">
          Mật khẩu (tối thiểu 8 ký tự)
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={loading || (captchaEnabled && !captchaToken)}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
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
