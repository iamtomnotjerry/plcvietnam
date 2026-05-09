import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import {
  authOutlineButtonClassName,
  authPrimaryButtonClassName,
} from '@/features/auth/form-classes';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'authRoutes' });
  const tSite = await getTranslations({ locale, namespace: 'site' });
  return {
    title: t('confirmed.metaTitle', { brand: tSite('brand') }),
  };
}

export default async function ConfirmedPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'authRoutes' });
  const { error } = await searchParams;
  const isError = error === '1';

  return (
    <AuthPageShell variant={isError ? 'email-confirm-failed' : 'email-confirmed'}>
      <div className="space-y-6 text-center">
        {isError ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <svg
                className="h-8 w-8 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-xl font-semibold text-foreground">
                {t('confirmed.invalidTitle')}
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t('confirmed.invalidBody')}
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Link href="/auth/sign-up" className={authPrimaryButtonClassName}>
                {t('confirmed.signUpAgain')}
              </Link>
              <Link href="/" className={authOutlineButtonClassName}>
                {t('confirmed.backHome')}
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg
                className="h-8 w-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="font-serif text-xl font-semibold text-foreground">
                {t('confirmed.successTitle')}
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t('confirmed.successBody')}
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Link href="/auth/sign-in" className={authPrimaryButtonClassName}>
                {t('confirmed.signIn')}
              </Link>
              <Link href="/" className={authOutlineButtonClassName}>
                {t('confirmed.backHome')}
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthPageShell>
  );
}
