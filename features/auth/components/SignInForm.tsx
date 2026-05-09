'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { resolveSafeCallbackPath } from '@/lib/auth/safe-callback';
import { TurnstileField } from '@/features/auth/components/TurnstileField';
import { AuthAlert } from '@/features/auth/components/AuthAlert';
import { isCaptchaConfigured } from '@/features/auth/captcha-config';
import { useAuthSubmit } from '@/features/auth/hooks/useAuthSubmit';
import { authInputClassName, authPrimaryButtonClassName } from '@/features/auth/form-classes';

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth.signIn');
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const registered = searchParams.get('registered') === '1';
  const resetOk = searchParams.get('reset') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetNonce, setCaptchaResetNonce] = useState(0);

  const { submit, error, loading } = useAuthSubmit();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submit({
      url: '/api/auth/sign-in',
      body: { email: email.trim(), password, captchaToken },
      defaultErrorMessage: t('failDefault'),
    });
    if (!result.ok) {
      if (isCaptchaConfigured) {
        setCaptchaToken(null);
        setCaptchaResetNonce((n) => n + 1);
      }
      return;
    }

    const safe = resolveSafeCallbackPath(callbackUrl);
    router.push(safe);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {registered && <AuthAlert variant="success">{t('registered')}</AuthAlert>}
      {resetOk && <AuthAlert variant="success">{t('resetOk')}</AuthAlert>}
      {error && <AuthAlert variant="error">{error}</AuthAlert>}
      <div>
        <label htmlFor="signin-email" className="mb-1 block text-sm font-medium">
          {t('email')}
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
          {t('password')}
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
        {loading ? t('submitting') : t('submit')}
      </button>
      <TurnstileField onTokenChange={setCaptchaToken} resetNonce={captchaResetNonce} />
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/forgot-password" className="text-primary hover:underline">
          {t('forgot')}
        </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
          {t('signUp')}
        </Link>
      </p>
    </form>
  );
}
