'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { TurnstileField } from '@/features/auth/components/TurnstileField';
import { AuthAlert } from '@/features/auth/components/AuthAlert';
import { isCaptchaConfigured } from '@/features/auth/captcha-config';
import { useAuthSubmit } from '@/features/auth/hooks/useAuthSubmit';
import { authInputClassName, authPrimaryButtonClassName } from '@/features/auth/form-classes';

const RESEND_COOLDOWN_MS = 60_000;

function normalizeForgotEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function ForgotPasswordForm() {
  const t = useTranslations('auth.forgot');
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetNonce, setCaptchaResetNonce] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  /** Cooldown applies only when the field still matches this email (same as server key). */
  const [cooldownEmail, setCooldownEmail] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const { submit, error, loading } = useAuthSubmit();

  const normalizedInput = normalizeForgotEmail(email);
  const inCooldown =
    cooldownEmail !== null &&
    cooldownUntil !== null &&
    normalizedInput === cooldownEmail &&
    now < cooldownUntil;
  const resendSecondsLeft = inCooldown ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0;

  useEffect(() => {
    if (!inCooldown) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [inCooldown]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const result = await submit({
      url: '/api/auth/forgot-password',
      body: { email, captchaToken },
      defaultErrorMessage: t('failDefault'),
    });
    if (result.ok) {
      setMessage(t('successMessage'));
      const norm = normalizeForgotEmail(email);
      setCooldownEmail(norm);
      setCooldownUntil(Date.now() + RESEND_COOLDOWN_MS);
      setNow(Date.now());
    } else if (isCaptchaConfigured) {
      setCaptchaToken(null);
      setCaptchaResetNonce((n) => n + 1);
    }
  }

  const submitBlocked = loading || (isCaptchaConfigured && !captchaToken) || resendSecondsLeft > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <AuthAlert variant="error">{error}</AuthAlert>}
      {message && <AuthAlert variant="info">{message}</AuthAlert>}
      <div>
        <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium">
          {t('email')}
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
      <button type="submit" disabled={submitBlocked} className={authPrimaryButtonClassName}>
        {loading
          ? t('submitting')
          : resendSecondsLeft > 0
            ? t('resendIn', { seconds: resendSecondsLeft })
            : t('submit')}
      </button>
      <TurnstileField onTokenChange={setCaptchaToken} resetNonce={captchaResetNonce} />
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/sign-in" className="text-primary hover:underline">
          {t('backSignIn')}
        </Link>
      </p>
    </form>
  );
}
