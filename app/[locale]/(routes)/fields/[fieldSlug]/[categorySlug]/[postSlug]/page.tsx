/**
 * Post Detail Page
 * Displays full post content with metadata and features
 * Validates Requirements: 2.1, 2.3, 2.4, 2.5, 8.6, 13.3, 13.4, 13.5
 */

import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { contentRepository } from '@/lib/data/factory';
import { PostDetail } from '@/features/posts/components/PostDetail';
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  renderJsonLd,
} from '@/lib/utils/structuredData';
import { withLocales } from '@/lib/i18n/staticParams';
import { absoluteUrlForLocale, metadataLanguageAlternates } from '@/lib/i18n/urls';
import { generatePostUrl } from '@/lib/utils/urlGeneration';

export const revalidate = 900;

interface PostPageProps {
  params: Promise<{
    locale: string;
    fieldSlug: string;
    categorySlug: string;
    postSlug: string;
  }>;
}

/**
 * Generate static params for all post pages
 * Enables static generation at build time
 */
export async function generateStaticParams() {
  const fields = await contentRepository.getFields();
  const params: { fieldSlug: string; categorySlug: string; postSlug: string }[] = [];

  for (const field of fields) {
    const categories = await contentRepository.getCategoriesByFieldId(field.id);
    for (const category of categories) {
      const postsResult = await contentRepository.getPostsByCategory(category.id);
      for (const post of postsResult.data) {
        params.push({
          fieldSlug: field.slug,
          categorySlug: category.slug,
          postSlug: post.slug,
        });
      }
    }
  }

  return withLocales(params);
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PostPageProps) {
  const { locale, fieldSlug, categorySlug, postSlug } = await params;
  setRequestLocale(locale);
  const post = await contentRepository.getPostBySlug(fieldSlug, categorySlug, postSlug);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://automation-blog.com';
  const path = generatePostUrl(fieldSlug, categorySlug, postSlug);

  if (!post) {
    const t = await getTranslations({ locale, namespace: 'errors' });
    return {
      title: t('postNotFoundTitle'),
    };
  }

  return {
    title: post.seo.title || post.title,
    description: post.seo.description || post.excerpt,
    keywords: post.seo.keywords,
    alternates: {
      canonical: absoluteUrlForLocale(locale, path, baseUrl),
      languages: metadataLanguageAlternates(path, baseUrl).languages,
    },
    openGraph: {
      title: post.seo.title || post.title,
      description: post.seo.description || post.excerpt,
      images: post.seo.ogImage ? [post.seo.ogImage] : post.thumbnailUrl ? [post.thumbnailUrl] : [],
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.author ? [post.author.name] : [],
      tags: post.tags.map((tag) => tag.name),
    },
  };
}

/**
 * Post Detail Page Component
 */
export default async function PostPage({ params }: PostPageProps) {
  const { locale, fieldSlug, categorySlug, postSlug } = await params;
  setRequestLocale(locale);
  // Fetch post
  const post = await contentRepository.getPostBySlug(fieldSlug, categorySlug, postSlug);

  // Handle 404 for invalid slugs
  if (!post) {
    notFound();
    return null; // TypeScript guard
  }

  // Fetch related posts (up to 4)
  const relatedPosts = await contentRepository.getRelatedPosts(post.id, 4);

  // Generate structured data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://automation-blog.com';
  const path = generatePostUrl(fieldSlug, categorySlug, postSlug);
  const postUrl = absoluteUrlForLocale(locale, path, baseUrl);

  const [tNav, tCommon, tPages, tSite] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'pages' }),
    getTranslations({ locale, namespace: 'site' }),
  ]);

  // Ensure author exists for schema generation - use fallback instead of 404
  const author = post.author ?? {
    id: '',
    name: tPages('postJsonLd.authorName'),
    email: '',
    bio: '',
    expertise: [],
    certifications: [],
    socialLinks: {},
  };

  const authorProfileUrl = absoluteUrlForLocale(locale, '/about', baseUrl);
  const articleSchema = generateArticleSchema(
    post,
    author,
    postUrl,
    tSite('brand'),
    authorProfileUrl
  );
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: tNav('home'), url: absoluteUrlForLocale(locale, '/', baseUrl) },
    {
      name: post.category?.field?.name || tCommon('fieldFallback'),
      url: absoluteUrlForLocale(locale, `/fields/${fieldSlug}`, baseUrl),
    },
    {
      name: post.category?.name || tCommon('categoryFallback'),
      url: absoluteUrlForLocale(locale, `/fields/${fieldSlug}/${categorySlug}`, baseUrl),
    },
    { name: post.title },
  ]);

  // Increment view count (client-side in mock provider)
  // This will be handled by the PostDetail component on mount

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderJsonLd(breadcrumbSchema) }}
      />
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <PostDetail post={post} relatedPosts={relatedPosts} />
        </div>
      </main>
    </>
  );
}
