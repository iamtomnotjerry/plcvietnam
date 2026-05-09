import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { SignUpForm } from '@/features/auth/components/SignUpForm';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'authRoutes' });
  const tSite = await getTranslations({ locale, namespace: 'site' });
  return {
    title: t('signUp.metaTitle', { brand: tSite('brand') }),
    description: t('signUp.metaDescription'),
  };
}

export default async function SignUpPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'authRoutes' });

  return (
    <AuthPageShell variant="sign-up">
      <div className="mb-6 space-y-1 text-center lg:text-left">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
          {t('signUp.heroTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('signUp.heroBody')}</p>
      </div>

      <SignUpForm />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/" className="text-primary transition-colors hover:underline">
          {t('signUp.backHome')}
        </Link>
      </p>
    </AuthPageShell>
  );
}
