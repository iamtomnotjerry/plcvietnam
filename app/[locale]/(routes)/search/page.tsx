/**
 * Search Page Route
 * Full search results page with grouped results and pagination
 */

import { Link } from '@/i18n/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SearchPageClient } from '@/features/search/components/SearchPageClient';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { q } = await searchParams;
  const query = q ?? '';
  const t = await getTranslations({ locale, namespace: 'pages' });
  const tSite = await getTranslations({ locale, namespace: 'site' });
  const brand = tSite('brand');
  return {
    title: query
      ? t('search.metaTitleWithQuery', { query, brand })
      : t('search.metaTitle', { brand }),
    description: query
      ? t('search.metaDescriptionWithQuery', { query, brand })
      : t('search.metaDescription'),
  };
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tPages = await getTranslations({ locale, namespace: 'pages' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const { q } = await searchParams;
  const query = q ?? '';

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <nav className="mb-6" aria-label={tCommon('breadcrumbAria')}>
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors cursor-pointer">
              {tNav('home')}
            </Link>
          </li>
          <li>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li>
            <span className="text-foreground font-medium">{tNav('search')}</span>
          </li>
          {query && (
            <>
              <li>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </li>
              <li>
                <span className="text-foreground font-medium truncate max-w-[200px] inline-block align-bottom">
                  {query}
                </span>
              </li>
            </>
          )}
        </ol>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {tPages('search.heroTitle')}
            </h1>
            <p className="text-lg text-muted-foreground mt-1">{tPages('search.heroSubtitle')}</p>
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <svg
              className="w-8 h-8 animate-spin text-primary"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        }
      >
        <SearchPageClient initialQuery={query} />
      </Suspense>
    </div>
  );
}
