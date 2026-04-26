/**
 * RSS Feed Generation Utility
 * Generates valid RSS 2.0 XML for blog posts
 * Requirements: 19.2, 19.3
 */

import type { Post, Author } from '@/lib/types/domain';

function publishedTimeMs(post: Post): number {
  const t = post.publishedAt.getTime();
  return Number.isFinite(t) ? t : Number.NEGATIVE_INFINITY;
}

/**
 * Escape special XML characters to prevent malformed XML
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate a valid RSS 2.0 XML feed from a collection of posts.
 *
 * - Posts are sorted descending by publication date
 * - Limited to the 50 most recent posts
 * - Each item includes: title, pubDate, description (excerpt), link, author
 *
 * @param posts   Array of Post objects (unsorted, any size)
 * @param baseUrl Base URL of the site (e.g. "https://automation-blog.com")
 * @param author  Author object for the feed
 * @returns       Valid RSS 2.0 XML string
 */
export function generateRSSFeed(posts: Post[], baseUrl: string, author: Author): string {
  const MAX_POSTS = 50;

  // Sort descending by publication date, then take the 50 most recent
  const sorted = [...posts]
    .sort((a, b) => publishedTimeMs(b) - publishedTimeMs(a))
    .slice(0, MAX_POSTS);

  const items = sorted.map((post) => {
    const fieldSlug = post.category?.field?.slug ?? '';
    const categorySlug = post.category?.slug ?? '';
    const postUrl = `${baseUrl}/fields/${encodeURIComponent(fieldSlug)}/${encodeURIComponent(categorySlug)}/${encodeURIComponent(post.slug)}`;

    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${post.publishedAt.toUTCString()}</pubDate>
      <author>${escapeXml(author.email)} (${escapeXml(author.name)})</author>
      <guid isPermaLink="true">${postUrl}</guid>
    </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml('PLC Việt Nam')}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml('Chia sẻ kiến thức tự động hóa công nghiệp')}</description>
    <language>vi</language>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>`;
}
