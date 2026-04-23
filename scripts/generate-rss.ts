/**
 * Build-time RSS feed generator for Mock Provider
 * Generates public/rss.xml at build time when using mock data
 * Requirements: 19.5
 *
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/generate-rss.ts
 *   or add to package.json scripts:
 *   "generate:rss": "ts-node scripts/generate-rss.ts"
 */

import fs from 'fs';
import path from 'path';
import { MockProvider } from '../lib/data/providers/mock';
import { generateRSSFeed } from '../lib/utils/rssFeed';

async function main() {
  const provider = new MockProvider();
  const posts = await provider.getRecentPosts(50);
  const author = await provider.getAuthor();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://automation-blog.com';
  const xml = generateRSSFeed(posts, baseUrl, author);

  const outputPath = path.join(process.cwd(), 'public', 'rss.xml');
  fs.writeFileSync(outputPath, xml, 'utf-8');

  console.log(`RSS feed written to ${outputPath} (${posts.length} posts)`);
}

main().catch((err) => {
  console.error('Failed to generate RSS feed:', err);
  process.exit(1);
});
