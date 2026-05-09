import { getLocale, getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { pathForLocale } from '@/lib/i18n/urls';

export async function generateMetadata(): Promise<Metadata> {
  const [t, tSite] = await Promise.all([getTranslations('errors'), getTranslations('site')]);
  return {
    title: `${t('notFoundTitle')} - ${tSite('brand')}`,
  };
}

export default async function NotFound() {
  const [t, locale] = await Promise.all([getTranslations('errors'), getLocale()]);
  const searchPath = pathForLocale(locale, '/search');

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <p className="text-8xl font-bold text-primary">404</p>
          <h1 className="text-2xl font-semibold text-foreground">{t('notFoundTitle')}</h1>
          <p className="text-muted-foreground">{t('notFoundBody')}</p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          {t('backHome')}
        </Link>

        <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-2">{t('searchPrompt')}</p>
          <form action={searchPath} method="get" className="flex gap-2">
            <input
              type="text"
              name="q"
              placeholder={t('searchPlaceholder')}
              className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              {t('searchSubmit')}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
