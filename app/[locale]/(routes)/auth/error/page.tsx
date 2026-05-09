import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { AuthErrorContent } from '@/features/auth/components/AuthErrorContent';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'authRoutes' });
  const tSite = await getTranslations({ locale, namespace: 'site' });
  return {
    title: t('error.metaTitle', { brand: tSite('brand') }),
  };
}

export default async function AuthErrorPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'authRoutes' });

  return (
    <AuthPageShell variant="auth-error">
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted/80" />}>
        <AuthErrorContent />
      </Suspense>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href={'/' as Route} className="text-primary transition-colors hover:underline">
          {t('error.backHome')}
        </Link>
      </p>
    </AuthPageShell>
  );
}
