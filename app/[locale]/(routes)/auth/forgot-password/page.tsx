import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'authRoutes' });
  const tSite = await getTranslations({ locale, namespace: 'site' });
  return {
    title: t('forgotPassword.metaTitle', { brand: tSite('brand') }),
  };
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'authRoutes' });

  return (
    <AuthPageShell variant="forgot-password">
      <div className="mb-6 space-y-1 text-center lg:text-left">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
          {t('forgotPassword.heroTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('forgotPassword.heroHint')}</p>
      </div>
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
