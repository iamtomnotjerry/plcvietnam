'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { authPrimaryButtonClassName } from '@/features/auth/form-classes';

export function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const t = useTranslations('auth.error');

  const isConfiguration = error === 'Configuration';

  return (
    <div className="space-y-6">
      <h1 className="sr-only">{t('srOnlyFail')}</h1>
      {isConfiguration ? (
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>{t('configIntro')}</p>
          <p className="font-medium text-foreground">{t('configHeading')}</p>
          <ul className="list-inside list-disc space-y-2 pl-1">
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{t('configUrlKey')}</code>{' '}
              {t('configUrlDesc')}
            </li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{t('configAnonKey')}</code>{' '}
              {t('configAnonDesc')}
            </li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {t('configServiceKey')}
              </code>{' '}
              {t('configServiceDesc')}
            </li>
          </ul>
          <p>{t('configRedeploy')}</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {error ? t('withCode', { error }) : t('generic')}
        </p>
      )}
      <div>
        <Link
          href="/auth/sign-in"
          className={`inline-flex w-full justify-center ${authPrimaryButtonClassName}`}
        >
          {t('backSignIn')}
        </Link>
      </div>
    </div>
  );
}
