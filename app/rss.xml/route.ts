import { NextResponse } from 'next/server';
import { contentRepository } from '@/lib/data/factory';
import { generateRSSFeed } from '@/lib/utils/rssFeed';

export async function GET() {
  const posts = await contentRepository.getRecentPosts(50);
  const author = await contentRepository.getAuthor();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://automation-blog.com';
  const xml = generateRSSFeed(posts, baseUrl, author);
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
