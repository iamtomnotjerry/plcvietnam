/**
 * Category Listing Page
 * Displays posts within a category
 * Validates Requirements: 2.1, 2.3, 2.4, 2.5
 */

import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { contentRepository } from '@/lib/data/factory';
import { PostList } from '@/features/posts/components/PostList';
import { Link } from '@/i18n/navigation';
import { fieldHref } from '@/lib/utils/routes';
import { withLocales } from '@/lib/i18n/staticParams';
import { absoluteUrlForLocale, metadataLanguageAlternates } from '@/lib/i18n/urls';

export const revalidate = 900;

interface CategoryPageProps {
  params: Promise<{
    locale: string;
    fieldSlug: string;
    categorySlug: string;
  }>;
}

/**
 * Generate static params for all category pages
 * Enables static generation at build time
 */
export async function generateStaticParams() {
  const fields = await contentRepository.getFields();
  const params: { fieldSlug: string; categorySlug: string }[] = [];

  for (const field of fields) {
    const categories = await contentRepository.getCategoriesByFieldId(field.id);
    for (const category of categories) {
      params.push({
        fieldSlug: field.slug,
        categorySlug: category.slug,
      });
    }
  }

  return withLocales(params);
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: CategoryPageProps) {
  const { locale, fieldSlug, categorySlug } = await params;
  setRequestLocale(locale);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://automation-blog.com';
  const path = `/fields/${fieldSlug}/${categorySlug}`;
  const category = await contentRepository.getCategoryBySlug(fieldSlug, categorySlug);

  if (!category) {
    const t = await getTranslations({ locale, namespace: 'errors' });
    return {
      title: t('categoryNotFoundTitle'),
    };
  }

  const [tPages, tSite] = await Promise.all([
    getTranslations({ locale, namespace: 'pages' }),
    getTranslations({ locale, namespace: 'site' }),
  ]);
  const description =
    category.description?.trim() ||
    tPages('category.metaDescriptionFallback', { name: category.name });

  return {
    title: tPages('category.metaTitle', {
      name: category.name,
      fieldName: category.field?.name ?? '',
      brand: tSite('brand'),
    }),
    description,
    alternates: {
      canonical: absoluteUrlForLocale(locale, path, baseUrl),
      languages: metadataLanguageAlternates(path, baseUrl).languages,
    },
  };
}

/**
 * Category Listing Page Component
 */
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, fieldSlug, categorySlug } = await params;
  setRequestLocale(locale);
  // Fetch category
  const category = await contentRepository.getCategoryBySlug(fieldSlug, categorySlug);

  // Handle 404 for invalid slugs
  if (!category) {
    notFound();
    return null; // TypeScript guard
  }

  // Fetch posts for this category (first page, 20 posts)
  const postsResult = await contentRepository.getPostsByCategory(category.id, {
    page: 1,
    limit: 20,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  const [tNav, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label={tCommon('breadcrumbAria')}>
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-primary transition-colors duration-200">
                {tNav('home')}
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
            <li>
              <Link
                href={category.field?.slug ? fieldHref(category.field.slug) : '/'}
                className="hover:text-primary transition-colors duration-200"
              >
                {category.field?.name}
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
            <li className="text-foreground font-medium">{category.name}</li>
          </ol>
        </nav>

        {/* Category Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-card-foreground mb-4">{category.name}</h1>
          <p className="text-lg text-muted-foreground mb-2">{category.description}</p>
          <p className="text-sm text-muted-foreground">
            {tCommon('postCount', { count: category.postCount })}
          </p>
        </header>

        {/* Post List */}
        <PostList posts={postsResult.data} showThumbnail={true} />
      </div>
    </main>
  );
}
