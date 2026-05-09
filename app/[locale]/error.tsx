'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations('errors');

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <p className="text-8xl font-bold text-destructive">500</p>
          <h1 className="text-2xl font-semibold text-foreground">{t('serverTitle')}</h1>
          <p className="text-muted-foreground">{error.message || t('serverFallback')}</p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              {t('errorCode', { digest: error.digest })}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-border bg-background text-foreground font-medium hover:bg-muted transition-colors cursor-pointer"
          >
            {t('retry')}
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            {t('backHome')}
          </Link>
        </div>
      </div>
    </main>
  );
}
