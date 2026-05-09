/**
 * Books Page Route
 * Display paginated list of books
 * Validates Requirements: 5.1, 5.5
 */

import { Suspense } from 'react';
import { contentRepository } from '@/lib/data/factory';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { BookPageClient } from '@/features/books/components/BookPageClient';

interface BooksPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: BooksPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages' });
  const tSite = await getTranslations({ locale, namespace: 'site' });
  return {
    title: t('books.metaTitle', { brand: tSite('brand') }),
    description: t('books.metaDescription'),
  };
}

export default async function BooksPage({ params, searchParams }: BooksPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tPages = await getTranslations({ locale, namespace: 'pages' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tErr = await getTranslations({ locale, namespace: 'errors' });

  const sp = await searchParams;
  const pageParam = parseInt(sp.page || '1', 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const limit = 12;

  try {
    const booksResult = await contentRepository.getBooks({ page, limit });

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
                xmlns="http://www.w3.org/2000/svg"
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
              <span className="text-foreground font-medium">{tNav('books')}</span>
            </li>
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
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {tPages('books.heroTitle')}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">{tPages('books.heroSubtitle')}</p>
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
          <BookPageClient
            books={booksResult.data}
            pagination={{
              page: booksResult.pagination.page,
              totalPages: booksResult.pagination.totalPages,
              total: booksResult.pagination.total,
            }}
            groupBySeries={true}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error('BooksPage: Failed to load books', error);

    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <nav className="mb-6" aria-label={tCommon('breadcrumbAria')}>
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors cursor-pointer">
                {tNav('home')}
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">{tNav('books')}</li>
          </ol>
        </nav>

        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <svg
            className="w-16 h-16 text-destructive mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-semibold mb-2">{tPages('books.loadErrorTitle')}</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {error instanceof Error ? error.message : tPages('books.loadErrorUnknown')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {tErr('retry')}
          </button>
        </div>
      </div>
    );
  }
}
