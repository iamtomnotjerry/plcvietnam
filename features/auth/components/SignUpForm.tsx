'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
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
  const t = useTranslations('auth.signUp');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetNonce, setCaptchaResetNonce] = useState(0);
  const [registered, setRegistered] = useState(false);
  const passwordValid = isPasswordChecklistValid(password, confirmPassword);

  const { submit, error, loading, setError } = useAuthSubmit();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) {
      setError(t('passwordPolicy'));
      return;
    }
    const result = await submit({
      url: '/api/auth/register',
      body: { full_name: name, email, password, captchaToken },
      defaultErrorMessage: t('failDefault'),
    });
    if (result.ok) {
      setRegistered(true);
    } else if (isCaptchaConfigured) {
      setCaptchaToken(null);
      setCaptchaResetNonce((n) => n + 1);
    }
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
        <h2 className="text-lg font-semibold text-foreground">{t('checkEmailTitle')}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t('checkEmailBody', { email })}
        </p>
        <Link
          href="/auth/sign-in"
          className={`inline-block w-full text-center ${authPrimaryButtonClassName}`}
        >
          {t('toSignIn')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <AuthAlert variant="error">{error}</AuthAlert>}
      <div>
        <label htmlFor="signup-name" className="mb-1 block text-sm font-medium">
          {t('displayName')}
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
          {t('email')}
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
          {t('password')}
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
          {t('confirmPassword')}
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
        {loading ? t('submitting') : t('submit')}
      </button>
      <TurnstileField onTokenChange={setCaptchaToken} resetNonce={captchaResetNonce} />
      <p className="text-center text-sm text-muted-foreground">
        {t('hasAccount')}{' '}
        <Link href="/auth/sign-in" className="font-medium text-primary hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </form>
  );
}
