'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter as useI18nRouter } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase/client';
import { AuthAlert } from '@/features/auth/components/AuthAlert';
import { PasswordChecklist } from '@/features/auth/components/PasswordChecklist';
import { useAuthSubmit } from '@/features/auth/hooks/useAuthSubmit';
import { authInputClassName, authPrimaryButtonClassName } from '@/features/auth/form-classes';

function ResetPasswordFormInner() {
  const router = useI18nRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth.reset');
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
        setError(t('sessionInvalid'));
      }

      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setIsSessionReady(true);
    }

    void bootstrapResetSession();
  }, [setError, t]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSessionReady) {
      setError(t('sessionWait'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('mismatch'));
      return;
    }

    const result = await submit({
      url: '/api/auth/reset-password',
      body: { password, confirmPassword },
      defaultErrorMessage: t('failDefault'),
    });
    if (!result.ok) return;

    await supabase.auth.signOut();
    router.push('/auth/sign-in?reset=1');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {tokenError && <AuthAlert variant="error">{t('tokenInvalid')}</AuthAlert>}
      {error && <AuthAlert variant="error">{error}</AuthAlert>}
      <div>
        <label htmlFor="reset-password" className="mb-1 block text-sm font-medium">
          {t('password')}
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
          {t('confirmNew')}
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
        {loading ? t('saving') : !isSessionReady ? t('verifying') : t('submit')}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/sign-in" className="text-primary hover:underline">
          {t('signInCta')}
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
