/**
 * Sitemap Generation
 * Generates sitemap.xml listing all published post URLs, books page, and about page.
 * Requirements: 10.2, 10.5
 */

import { MetadataRoute } from 'next';
import { contentRepository } from '@/lib/data/factory';
import { routing } from '@/i18n/routing';
import { absoluteUrlForLocale, metadataLanguageAlternates } from '@/lib/i18n/urls';
import { generatePostUrl } from '@/lib/utils/urlGeneration';

export const revalidate = 86400;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://automation-blog.com';

function entryForPath(
  path: string,
  options: Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'>
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrlForLocale(routing.defaultLocale, path, BASE_URL),
    alternates: { languages: metadataLanguageAlternates(path, BASE_URL).languages },
    ...options,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    entryForPath('/', { lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 }),
    entryForPath('/posts', { lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 }),
    entryForPath('/books', { lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 }),
    entryForPath('/about', { lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 }),
  ];

  const booksResult = await contentRepository.getBooks({ page: 1, limit: 200 });
  const bookPages: MetadataRoute.Sitemap = booksResult.data.map((book) => {
    const path = `/books/${book.slug}`;
    return entryForPath(path, {
      lastModified: new Date(book.createdAt),
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    });
  });

  const postPages: MetadataRoute.Sitemap = [];
  const fields = await contentRepository.getFields();

  for (const field of fields) {
    const categories = await contentRepository.getCategoriesByFieldId(field.id);
    for (const category of categories) {
      const postsResult = await contentRepository.getPostsByCategory(category.id);
      for (const post of postsResult.data) {
        const path = generatePostUrl(field.slug, category.slug, post.slug);
        postPages.push(
          entryForPath(path, {
            lastModified: new Date(post.updatedAt),
            changeFrequency: 'monthly',
            priority: 0.7,
          })
        );
      }
    }
  }

  return [...staticPages, ...bookPages, ...postPages];
}
