/**
 * Sitemap Generation
 * Generates sitemap.xml listing all published post URLs, books page, and about page.
 * Requirements: 10.2, 10.5
 */

import { MetadataRoute } from 'next';
import { contentRepository } from '@/lib/data/factory';

export const dynamic = 'force-dynamic';
import { generatePostUrl } from '@/lib/utils/urlGeneration';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://automation-blog.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/posts`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/books`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const booksResult = await contentRepository.getBooks({ page: 1, limit: 200 });
  const bookPages: MetadataRoute.Sitemap = booksResult.data.map((book) => ({
    url: `${BASE_URL}/books/${book.slug}`,
    lastModified: new Date(book.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }));

  const postPages: MetadataRoute.Sitemap = [];
  const fields = await contentRepository.getFields();

  for (const field of fields) {
    const categories = await contentRepository.getCategoriesByFieldId(field.id);
    for (const category of categories) {
      const postsResult = await contentRepository.getPostsByCategory(category.id);
      for (const post of postsResult.data) {
        postPages.push({
          url: `${BASE_URL}${generatePostUrl(field.slug, category.slug, post.slug)}`,
          lastModified: new Date(post.updatedAt),
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    }
  }

  return [...staticPages, ...bookPages, ...postPages];
}
