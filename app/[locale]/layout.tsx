import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { Lora, Plus_Jakarta_Sans } from 'next/font/google';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { NavigationProgress } from '@/components/ui/NavigationProgress';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthSessionProvider } from '@/components/auth/AuthSessionProvider';
import { WebVitals } from '../web-vitals';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Lora({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-serif',
  display: 'swap',
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: Omit<Props, 'children'>) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'LocaleLayout' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      types: {
        'application/rss+xml': '/rss.xml',
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={`${sans.variable} ${serif.variable}`}>
      <body className={`${sans.className} antialiased`}>
        <ErrorBoundary>
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider>
              <AuthSessionProvider>
                <NavigationProgress />
                <AppLayout>{children}</AppLayout>
                <WebVitals />
              </AuthSessionProvider>
            </ThemeProvider>
          </NextIntlClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
