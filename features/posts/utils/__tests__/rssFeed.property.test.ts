/**
 * Property-Based Tests for RSS Feed Generation
 * Feature: automation-blog, Property 7: RSS Feed Correctness
 * Validates: Requirements 19.2, 19.3
 *
 * For any collection of posts, the generated RSS feed SHALL:
 * - Include all required fields (title, pubDate, description, link, author)
 * - List posts in descending order by publication date
 * - Limit results to the 50 most recent posts
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateRSSFeed } from '@/lib/utils/rssFeed';
import type { Post, Author, Category, Field, Tag } from '@/lib/types/domain';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const safeStringArb = fc.string({ minLength: 1, maxLength: 50 }).filter(
  (s) => !s.includes('\0')
);

const slugArb = fc.stringMatching(/^[a-z0-9-]{1,20}$/);

const dateArb = fc.date({
  min: new Date('2020-01-01T00:00:00Z'),
  max: new Date('2030-12-31T23:59:59Z'),
});

const fieldArb: fc.Arbitrary<Field> = fc.record({
  id: safeStringArb,
  slug: slugArb,
  name: safeStringArb,
  description: safeStringArb,
  postCount: fc.nat(),
  createdAt: dateArb,
  updatedAt: dateArb,
});

const categoryArb: fc.Arbitrary<Category> = fieldArb.chain((field) =>
  fc.record({
    id: safeStringArb,
    slug: slugArb,
    name: safeStringArb,
    description: safeStringArb,
    fieldId: fc.constant(field.id),
    field: fc.constant(field),
    postCount: fc.nat(),
    order: fc.nat(),
    createdAt: dateArb,
    updatedAt: dateArb,
  })
);

const postArb = (category: Category): fc.Arbitrary<Post> =>
  fc.record({
    id: safeStringArb,
    slug: slugArb,
    title: safeStringArb,
    excerpt: safeStringArb,
    content: safeStringArb,
    categoryId: fc.constant(category.id),
    category: fc.constant(category),
    authorId: fc.constant('author-1'),
    tags: fc.constant<Tag[]>([]),
    publishedAt: dateArb,
    updatedAt: dateArb,
    viewCount: fc.nat(),
    readingTimeMinutes: fc.integer({ min: 1, max: 60 }),
    seo: fc.constant({ title: 'title', description: 'desc', keywords: [] }),
  });

const authorArb: fc.Arbitrary<Author> = fc.record({
  id: fc.constant('author-1'),
  name: safeStringArb,
  email: fc.emailAddress(),
  bio: safeStringArb,
  expertise: fc.constant([]),
  certifications: fc.constant([]),
  socialLinks: fc.constant({}),
});

const postsArb = (maxCount: number) =>
  categoryArb.chain((category) =>
    fc.array(postArb(category), { minLength: 0, maxLength: maxCount })
  );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Property 7: RSS Feed Correctness', () => {
  /**
   * Validates: Requirements 19.2
   * Each item in the feed must contain title, pubDate, description, link, author
   */
  it('should include all required fields for each post', () => {
    fc.assert(
      fc.property(
        postsArb(20),
        authorArb,
        fc.constant('https://example.com'),
        (posts, author, baseUrl) => {
          const xml = generateRSSFeed(posts, baseUrl, author);

          const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
          const expectedCount = Math.min(posts.length, 50);
          expect(itemMatches.length).toBe(expectedCount);

          for (const item of itemMatches) {
            expect(item).toMatch(/<title>/);
            expect(item).toMatch(/<pubDate>/);
            expect(item).toMatch(/<description>/);
            expect(item).toMatch(/<link>/);
            expect(item).toMatch(/<author>/);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 19.3
   * Posts must appear in descending order by publication date
   */
  it('should list posts in descending order by publication date', () => {
    fc.assert(
      fc.property(
        postsArb(20),
        authorArb,
        fc.constant('https://example.com'),
        (posts, author, baseUrl) => {
          if (posts.length < 2) return; // nothing to compare

          const xml = generateRSSFeed(posts, baseUrl, author);

          // Extract pubDate values in order (skip if XML dates do not parse — edge cases from generators)
          const pubDateMatches = [...xml.matchAll(/<pubDate>(.*?)<\/pubDate>/g)];
          const dates = pubDateMatches
            .map((m) => new Date(m[1]).getTime())
            .filter((t) => !Number.isNaN(t));
          if (dates.length < 2) return;

          for (let i = 0; i < dates.length - 1; i++) {
            expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 19.3
   * Feed must be limited to at most 50 posts
   */
  it('should limit the feed to at most 50 posts', () => {
    fc.assert(
      fc.property(
        postsArb(80),
        authorArb,
        fc.constant('https://example.com'),
        (posts, author, baseUrl) => {
          const xml = generateRSSFeed(posts, baseUrl, author);
          const itemCount = (xml.match(/<item>/g) ?? []).length;
          expect(itemCount).toBeLessThanOrEqual(50);
          expect(itemCount).toBe(Math.min(posts.length, 50));
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 19.3
   * When more than 50 posts exist, only the 50 most recent are included.
   * Uses 60 posts with guaranteed-distinct timestamps via shuffled index offsets.
   */
  it('should include only the 50 most recent posts when collection exceeds 50', () => {
    fc.assert(
      fc.property(
        categoryArb,
        authorArb,
        fc.constant('https://example.com'),
        // Shuffle indices 0..59 to get a random ordering of distinct second-offsets
        fc.shuffledSubarray(Array.from({ length: 60 }, (_, i) => i), { minLength: 60, maxLength: 60 }),
        (category, author, baseUrl, offsets) => {
          const BASE_TS = 1577836800000; // 2020-01-01T00:00:00Z
          const posts: Post[] = offsets.map((offset, i) => ({
            id: `post-${i}`,
            slug: `post-${i}`,
            title: `Post ${i}`,
            excerpt: `Excerpt ${i}`,
            content: '',
            categoryId: category.id,
            category,
            authorId: 'author-1',
            tags: [] as Tag[],
            publishedAt: new Date(BASE_TS + offset * 1000),
            updatedAt: new Date(BASE_TS + offset * 1000),
            viewCount: 0,
            readingTimeMinutes: 1,
            seo: { title: '', description: '', keywords: [] },
          }));

          const xml = generateRSSFeed(posts, baseUrl, author);

          // Compute expected top-50 and bottom-10 post IDs
          const sortedPosts = [...posts].sort(
            (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
          );
          const top50Ids = new Set(sortedPosts.slice(0, 50).map((p) => p.id));
          const bottom10Ids = new Set(sortedPosts.slice(50).map((p) => p.id));

          // Extract titles from the feed — each title is unique "Post {i}"
          const titleMatches = [...xml.matchAll(/<title>(Post \d+)<\/title>/g)];
          expect(titleMatches.length).toBe(50);

          for (const match of titleMatches) {
            const id = `post-${match[1].split(' ')[1]}`;
            expect(top50Ids.has(id)).toBe(true);
            expect(bottom10Ids.has(id)).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
