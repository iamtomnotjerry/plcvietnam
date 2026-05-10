/**
 * Homepage Route
 * Assembles all homepage sections with data from contentRepository
 * Validates Requirements: 11.1, 11.6, 11.7
 */

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { contentRepository } from '@/lib/data/factory';
import {
  HeroSection,
  RecentPostsSection,
  FieldsSection,
  FeaturedBooksSection,
} from '@/features/homepage/components';
import { generateWebSiteSchema, renderJsonLd } from '@/lib/utils/structuredData';
import { ErrorRetryButton } from '@/components/ui/ErrorRetryButton';
import { absoluteUrlForLocale } from '@/lib/i18n/urls';

export const revalidate = 900;

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://automationblog.vn';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tSite] = await Promise.all([
    getTranslations({ locale, namespace: 'home' }),
    getTranslations({ locale, namespace: 'site' }),
  ]);
  const homeUrl = absoluteUrlForLocale(locale, '/', baseUrl);
  const searchTarget = `${absoluteUrlForLocale(locale, '/search', baseUrl)}?q={search_term_string}`;

  try {
    const [recentPosts, fieldsWithFirstCategory, featuredBooks] = await Promise.all([
      contentRepository.getRecentPosts(6),
      contentRepository.getFieldsWithFirstCategory(),
      contentRepository.getFeaturedBooks(3),
    ]);

    return (
      <main className="min-h-screen overflow-x-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: renderJsonLd(
              generateWebSiteSchema(
                homeUrl,
                { name: tSite('brand'), description: t('description') },
                searchTarget
              )
            ),
          }}
        />

        <HeroSection title={t('title')} tagline={t('tagline')} description={t('description')} />

        <RecentPostsSection posts={recentPosts} />

        {recentPosts.length === 0 && fieldsWithFirstCategory.length === 0 && (
          <section className="section-surface-glass py-24">
            <div className="editorial-container relative max-w-2xl text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">{t('emptyTitle')}</h2>
              <p className="text-muted-foreground">{t('emptyBody')}</p>
            </div>
          </section>
        )}

        <FieldsSection fields={fieldsWithFirstCategory} />

        <FeaturedBooksSection books={featuredBooks} />
      </main>
    );
  } catch (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">{t('loadErrorTitle')}</h1>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : t('loadErrorUnknown')}
          </p>
          <ErrorRetryButton />
        </div>
      </main>
    );
  }
}
