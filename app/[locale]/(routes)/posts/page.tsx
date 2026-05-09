import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { contentRepository } from '@/lib/data/factory';
import { PostsPageClient } from '@/features/posts/components/PostsPageClient';

export const revalidate = 900;

interface PostsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PostsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pages' });
  const tSite = await getTranslations({ locale, namespace: 'site' });
  return {
    title: t('posts.metaTitle', { brand: tSite('brand') }),
    description: t('posts.metaDescription'),
  };
}

export default async function PostsPage({ params, searchParams }: PostsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tPages = await getTranslations({ locale, namespace: 'pages' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tErr = await getTranslations({ locale, namespace: 'errors' });

  const sp = await searchParams;
  const pageParam = parseInt(sp.page || '1', 10);
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const limit = 12;

  try {
    const postsResult = await contentRepository.getPosts({
      page,
      limit,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    });

    return (
      <main className="min-h-screen">
        <div className="border-b border-border bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 py-12 max-w-6xl">
            <nav
              className="mb-6 text-sm text-muted-foreground"
              aria-label={tCommon('breadcrumbAria')}
            >
              <ol className="flex items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-foreground transition-colors">
                    {tNav('home')}
                  </Link>
                </li>
                <li>/</li>
                <li className="text-foreground font-medium">{tNav('posts')}</li>
              </ol>
            </nav>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-3">
              {tPages('posts.heroTitle')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {tPages('posts.heroSubtitle')}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 max-w-6xl">
          <Suspense
            fallback={
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            }
          >
            <PostsPageClient
              posts={postsResult.data}
              pagination={{
                page: postsResult.pagination.page,
                totalPages: postsResult.pagination.totalPages,
              }}
            />
          </Suspense>
        </div>
      </main>
    );
  } catch (error) {
    console.error('PostsPage: Failed to load posts', error);

    return (
      <main className="min-h-screen">
        <div className="border-b border-border bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4 py-12 max-w-6xl">
            <nav
              className="mb-6 text-sm text-muted-foreground"
              aria-label={tCommon('breadcrumbAria')}
            >
              <ol className="flex items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-foreground transition-colors">
                    {tNav('home')}
                  </Link>
                </li>
                <li>/</li>
                <li className="text-foreground font-medium">{tNav('posts')}</li>
              </ol>
            </nav>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-3">
              {tPages('posts.heroTitle')}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 max-w-6xl">
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
            <h2 className="text-2xl font-semibold mb-2">{tPages('posts.loadErrorTitle')}</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {error instanceof Error ? error.message : tPages('posts.loadErrorUnknown')}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {tErr('retry')}
            </button>
          </div>
        </div>
      </main>
    );
  }
}
