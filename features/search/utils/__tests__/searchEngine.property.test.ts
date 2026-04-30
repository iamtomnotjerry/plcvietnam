/**
 * Property-Based Tests for Search Engine
 * Feature: automation-blog, Property 5: Search Result Correctness
 *
 * **Validates: Requirements 9.3, 9.6**
 *
 * For any search query string and collection of posts and books, all returned results
 * SHALL contain the query string (case-insensitive) in at least one of the searchable
 * fields (post title, post excerpt, category name, post tags, book title, book description),
 * and results SHALL be a subset of the input collection.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { searchContent } from '../searchEngine';
import { Post, Book, Tag, Category } from '@/lib/types/domain';

/**
 * Generator for Tag objects
 */
const tagArbitrary = fc.record({
  id: fc.uuid(),
  slug: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  postCount: fc.integer({ min: 0, max: 100 }),
});

/**
 * Generator for Category objects
 */
const categoryArbitrary = fc.record({
  id: fc.uuid(),
  slug: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ minLength: 10, maxLength: 200 }),
  fieldId: fc.uuid(),
  postCount: fc.integer({ min: 0, max: 100 }),
  order: fc.integer({ min: 0, max: 100 }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
});

/**
 * Generator for Post objects
 */
const postArbitrary = (availableTags: Tag[], availableCategories: Category[]) =>
  fc.record({
    id: fc.uuid(),
    slug: fc.string({ minLength: 1, maxLength: 30 }),
    title: fc.string({ minLength: 5, maxLength: 100 }),
    excerpt: fc.string({ minLength: 10, maxLength: 200 }),
    content: fc.string({ minLength: 50, maxLength: 1000 }),
    thumbnailUrl: fc.option(fc.webUrl(), { nil: undefined }),
    categoryId: fc.uuid(),
    category:
      availableCategories.length > 0
        ? fc.constantFrom(...availableCategories)
        : fc.constant(undefined),
    authorId: fc.uuid(),
    tags: fc.subarray(availableTags, {
      minLength: 0,
      maxLength: Math.min(5, availableTags.length),
    }),
    publishedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
    updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
    viewCount: fc.integer({ min: 0, max: 10000 }),
    readingTimeMinutes: fc.integer({ min: 1, max: 60 }),
    seo: fc.record({
      title: fc.string({ minLength: 5, maxLength: 100 }),
      description: fc.string({ minLength: 10, maxLength: 200 }),
      ogImage: fc.option(fc.webUrl(), { nil: undefined }),
      keywords: fc.array(fc.string({ minLength: 3, maxLength: 20 }), {
        minLength: 0,
        maxLength: 10,
      }),
    }),
  });

/**
 * Generator for Book objects
 */
const bookArbitrary = fc.record({
  id: fc.uuid(),
  slug: fc.string({ minLength: 1, maxLength: 30 }),
  title: fc.string({ minLength: 5, maxLength: 100 }),
  description: fc.string({ minLength: 10, maxLength: 300 }),
  coverImageUrl: fc.webUrl(),
  authorName: fc.string({ minLength: 3, maxLength: 50 }),
  series: fc.option(fc.string({ minLength: 3, maxLength: 50 }), { nil: undefined }),
  downloadUrl: fc.option(fc.webUrl(), { nil: undefined }),
  externalUrl: fc.option(fc.webUrl(), { nil: undefined }),
  publishedYear: fc.option(fc.integer({ min: 1900, max: 2024 }), { nil: undefined }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
});

/**
 * Helper function to check if a post matches a query
 */
function postMatchesQuery(post: Post, query: string): boolean {
  const normalizedQuery = query.toLowerCase().trim();

  const titleMatch = post.title.toLowerCase().includes(normalizedQuery);
  const excerptMatch = post.excerpt.toLowerCase().includes(normalizedQuery);
  const categoryMatch = post.category?.name.toLowerCase().includes(normalizedQuery) ?? false;
  const tagMatch = post.tags.some((tag) => tag.name.toLowerCase().includes(normalizedQuery));

  return titleMatch || excerptMatch || categoryMatch || tagMatch;
}

/**
 * Helper function to check if a book matches a query
 */
function bookMatchesQuery(book: Book, query: string): boolean {
  const normalizedQuery = query.toLowerCase().trim();

  const titleMatch = book.title.toLowerCase().includes(normalizedQuery);
  const descMatch = book.description.toLowerCase().includes(normalizedQuery);

  return titleMatch || descMatch;
}

/**
 * Generator for test scenario with content collections and search query
 */
const testScenarioArbitrary = fc
  .array(tagArbitrary, { minLength: 0, maxLength: 10 })
  .chain((tags) =>
    fc
      .array(categoryArbitrary, { minLength: 0, maxLength: 5 })
      .chain((categories) =>
        fc
          .tuple(
            fc.array(postArbitrary(tags, categories), { minLength: 0, maxLength: 20 }),
            fc.array(bookArbitrary, { minLength: 0, maxLength: 10 }),
            fc.string({ minLength: 0, maxLength: 50 })
          )
          .map(([posts, books, query]) => ({ posts, books, query }))
      )
  );

describe('Property: Search Result Correctness', () => {
  it('should return empty results for queries with less than 2 characters', () => {
    fc.assert(
      fc.property(
        testScenarioArbitrary,
        fc.constantFrom('', ' ', 'a', '1', '!'),
        ({ posts, books }, shortQuery) => {
          const results = searchContent(shortQuery, posts, books);

          // Queries < 2 characters should return empty results (Req 9.2)
          expect(results.posts).toEqual([]);
          expect(results.books).toEqual([]);
          expect(results.totalResults).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should only return posts that contain the query in searchable fields', () => {
    fc.assert(
      fc.property(testScenarioArbitrary, ({ posts, books, query }) => {
        // Skip queries < 2 characters
        if (query.trim().length < 2) return;

        const results = searchContent(query, posts, books);

        // All returned posts must match the query
        results.posts.forEach((post) => {
          const matches = postMatchesQuery(post, query);
          expect(matches).toBe(true);
        });
      }),
      { numRuns: 100 }
    );
  });

  it('should only return books that contain the query in searchable fields', () => {
    fc.assert(
      fc.property(testScenarioArbitrary, ({ posts, books, query }) => {
        // Skip queries < 2 characters
        if (query.trim().length < 2) return;

        const results = searchContent(query, posts, books);

        // All returned books must match the query
        results.books.forEach((book) => {
          const matches = bookMatchesQuery(book, query);
          expect(matches).toBe(true);
        });
      }),
      { numRuns: 100 }
    );
  });

  it('should return results that are a subset of the input collection', () => {
    fc.assert(
      fc.property(testScenarioArbitrary, ({ posts, books, query }) => {
        const results = searchContent(query, posts, books);

        // All returned posts must be from the input collection
        const inputPostIds = new Set(posts.map((p) => p.id));
        results.posts.forEach((post) => {
          expect(inputPostIds.has(post.id)).toBe(true);
        });

        // All returned books must be from the input collection
        const inputBookIds = new Set(books.map((b) => b.id));
        results.books.forEach((book) => {
          expect(inputBookIds.has(book.id)).toBe(true);
        });
      }),
      { numRuns: 100 }
    );
  });

  it('should calculate totalResults correctly as sum of posts and books', () => {
    fc.assert(
      fc.property(testScenarioArbitrary, ({ posts, books, query }) => {
        const results = searchContent(query, posts, books);

        // totalResults should equal posts.length + books.length
        expect(results.totalResults).toBe(results.posts.length + results.books.length);
      }),
      { numRuns: 100 }
    );
  });

  it('should perform case-insensitive search', () => {
    fc.assert(
      fc.property(testScenarioArbitrary, ({ posts, books, query }) => {
        // Skip queries < 2 characters
        if (query.trim().length < 2) return;

        const lowerResults = searchContent(query.toLowerCase(), posts, books);
        const upperResults = searchContent(query.toUpperCase(), posts, books);
        const mixedResults = searchContent(query, posts, books);

        // All three should return the same results (case-insensitive)
        expect(lowerResults.totalResults).toBe(upperResults.totalResults);
        expect(lowerResults.totalResults).toBe(mixedResults.totalResults);

        // Sort by ID to compare arrays
        const sortById = (a: Post | Book, b: Post | Book) => a.id.localeCompare(b.id);

        expect(lowerResults.posts.map((p) => p.id).sort()).toEqual(
          upperResults.posts.map((p) => p.id).sort()
        );
        expect(lowerResults.books.map((b) => b.id).sort()).toEqual(
          upperResults.books.map((b) => b.id).sort()
        );
      }),
      { numRuns: 100 }
    );
  });

  it('should handle queries with leading/trailing whitespace', () => {
    fc.assert(
      fc.property(
        testScenarioArbitrary,
        fc.constantFrom('  ', '\t', '\n', '   '),
        ({ posts, books, query }, whitespace) => {
          // Skip queries < 2 characters after trimming
          if (query.trim().length < 2) return;

          const normalResults = searchContent(query, posts, books);
          const paddedResults = searchContent(whitespace + query + whitespace, posts, books);

          // Results should be identical (whitespace trimmed)
          expect(normalResults.totalResults).toBe(paddedResults.totalResults);
          expect(normalResults.posts.map((p) => p.id).sort()).toEqual(
            paddedResults.posts.map((p) => p.id).sort()
          );
          expect(normalResults.books.map((b) => b.id).sort()).toEqual(
            paddedResults.books.map((b) => b.id).sort()
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should search across post title field', () => {
    fc.assert(
      fc.property(
        fc.array(tagArbitrary, { minLength: 1, maxLength: 5 }),
        fc.array(categoryArbitrary, { minLength: 1, maxLength: 3 }),
        fc.string({ minLength: 5, maxLength: 20 }),
        (tags, categories, searchTerm) => {
          // Create a post with the search term in the title
          const post: Post = {
            id: fc.sample(fc.uuid(), 1)[0],
            slug: 'test-post',
            title: `This is a ${searchTerm} in the title`,
            excerpt: 'Different content here',
            content: 'More different content',
            categoryId: categories[0].id,
            category: categories[0],
            authorId: fc.sample(fc.uuid(), 1)[0],
            tags: [],
            publishedAt: new Date(),
            updatedAt: new Date(),
            viewCount: 0,
            readingTimeMinutes: 5,
            seo: {
              title: 'SEO Title',
              description: 'SEO Description',
              keywords: [],
            },
          };

          const results = searchContent(searchTerm, [post], []);

          // Should find the post
          expect(results.posts.length).toBeGreaterThan(0);
          expect(results.posts[0].id).toBe(post.id);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should search across post excerpt field', () => {
    fc.assert(
      fc.property(
        fc.array(tagArbitrary, { minLength: 1, maxLength: 5 }),
        fc.array(categoryArbitrary, { minLength: 1, maxLength: 3 }),
        fc.string({ minLength: 5, maxLength: 20 }),
        (tags, categories, searchTerm) => {
          // Create a post with the search term in the excerpt
          const post: Post = {
            id: fc.sample(fc.uuid(), 1)[0],
            slug: 'test-post',
            title: 'Different title',
            excerpt: `This excerpt contains ${searchTerm} here`,
            content: 'More different content',
            categoryId: categories[0].id,
            category: categories[0],
            authorId: fc.sample(fc.uuid(), 1)[0],
            tags: [],
            publishedAt: new Date(),
            updatedAt: new Date(),
            viewCount: 0,
            readingTimeMinutes: 5,
            seo: {
              title: 'SEO Title',
              description: 'SEO Description',
              keywords: [],
            },
          };

          const results = searchContent(searchTerm, [post], []);

          // Should find the post
          expect(results.posts.length).toBeGreaterThan(0);
          expect(results.posts[0].id).toBe(post.id);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should search across category name field', () => {
    fc.assert(
      fc.property(
        fc.array(tagArbitrary, { minLength: 1, maxLength: 5 }),
        fc.string({ minLength: 5, maxLength: 20 }),
        (tags, searchTerm) => {
          // Create a category with the search term in the name
          const category: Category = {
            id: fc.sample(fc.uuid(), 1)[0],
            slug: 'test-category',
            name: `Category with ${searchTerm}`,
            description: 'Different description',
            fieldId: fc.sample(fc.uuid(), 1)[0],
            postCount: 1,
            order: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const post: Post = {
            id: fc.sample(fc.uuid(), 1)[0],
            slug: 'test-post',
            title: 'Different title',
            excerpt: 'Different excerpt',
            content: 'Different content',
            categoryId: category.id,
            category: category,
            authorId: fc.sample(fc.uuid(), 1)[0],
            tags: [],
            publishedAt: new Date(),
            updatedAt: new Date(),
            viewCount: 0,
            readingTimeMinutes: 5,
            seo: {
              title: 'SEO Title',
              description: 'SEO Description',
              keywords: [],
            },
          };

          const results = searchContent(searchTerm, [post], []);

          // Should find the post via category name
          expect(results.posts.length).toBeGreaterThan(0);
          expect(results.posts[0].id).toBe(post.id);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should search across post tag names', () => {
    fc.assert(
      fc.property(
        fc.array(categoryArbitrary, { minLength: 1, maxLength: 3 }),
        fc.string({ minLength: 5, maxLength: 20 }),
        (categories, searchTerm) => {
          // Create a tag with the search term in the name
          const tag: Tag = {
            id: fc.sample(fc.uuid(), 1)[0],
            slug: 'test-tag',
            name: `Tag ${searchTerm}`,
            postCount: 1,
          };

          const post: Post = {
            id: fc.sample(fc.uuid(), 1)[0],
            slug: 'test-post',
            title: 'Different title',
            excerpt: 'Different excerpt',
            content: 'Different content',
            categoryId: categories[0].id,
            category: categories[0],
            authorId: fc.sample(fc.uuid(), 1)[0],
            tags: [tag],
            publishedAt: new Date(),
            updatedAt: new Date(),
            viewCount: 0,
            readingTimeMinutes: 5,
            seo: {
              title: 'SEO Title',
              description: 'SEO Description',
              keywords: [],
            },
          };

          const results = searchContent(searchTerm, [post], []);

          // Should find the post via tag name
          expect(results.posts.length).toBeGreaterThan(0);
          expect(results.posts[0].id).toBe(post.id);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should search across book title field', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 5, maxLength: 20 }), (searchTerm) => {
        // Create a book with the search term in the title
        const book: Book = {
          id: fc.sample(fc.uuid(), 1)[0],
          slug: 'test-book',
          title: `Book with ${searchTerm}`,
          description: 'Different description',
          coverImageUrl: 'https://example.com/cover.jpg',
          authorName: 'Test Author',
          createdAt: new Date(),
        };

        const results = searchContent(searchTerm, [], [book]);

        // Should find the book
        expect(results.books.length).toBeGreaterThan(0);
        expect(results.books[0].id).toBe(book.id);
      }),
      { numRuns: 50 }
    );
  });

  it('should search across book description field', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 5, maxLength: 20 }), (searchTerm) => {
        // Create a book with the search term in the description
        const book: Book = {
          id: fc.sample(fc.uuid(), 1)[0],
          slug: 'test-book',
          title: 'Different title',
          description: `Description with ${searchTerm} here`,
          coverImageUrl: 'https://example.com/cover.jpg',
          authorName: 'Test Author',
          createdAt: new Date(),
        };

        const results = searchContent(searchTerm, [], [book]);

        // Should find the book
        expect(results.books.length).toBeGreaterThan(0);
        expect(results.books[0].id).toBe(book.id);
      }),
      { numRuns: 50 }
    );
  });

  it('should produce consistent results for the same input', () => {
    fc.assert(
      fc.property(testScenarioArbitrary, ({ posts, books, query }) => {
        const results1 = searchContent(query, posts, books);
        const results2 = searchContent(query, posts, books);

        // Same input should always produce same output (determinism)
        expect(results1.totalResults).toBe(results2.totalResults);
        expect(results1.posts.map((p) => p.id).sort()).toEqual(
          results2.posts.map((p) => p.id).sort()
        );
        expect(results1.books.map((b) => b.id).sort()).toEqual(
          results2.books.map((b) => b.id).sort()
        );
      }),
      { numRuns: 100 }
    );
  });

  it('should handle empty input collections', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 2, maxLength: 50 }), (query) => {
        const results = searchContent(query, [], []);

        // Should return empty results
        expect(results.posts).toEqual([]);
        expect(results.books).toEqual([]);
        expect(results.totalResults).toBe(0);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle posts without categories', () => {
    fc.assert(
      fc.property(
        fc.array(tagArbitrary, { minLength: 1, maxLength: 5 }),
        fc.string({ minLength: 5, maxLength: 20 }),
        (tags, searchTerm) => {
          // Create a post without a category
          const post: Post = {
            id: fc.sample(fc.uuid(), 1)[0],
            slug: 'test-post',
            title: `Title with ${searchTerm}`,
            excerpt: 'Different excerpt',
            content: 'Different content',
            categoryId: fc.sample(fc.uuid(), 1)[0],
            category: undefined, // No category
            authorId: fc.sample(fc.uuid(), 1)[0],
            tags: [],
            publishedAt: new Date(),
            updatedAt: new Date(),
            viewCount: 0,
            readingTimeMinutes: 5,
            seo: {
              title: 'SEO Title',
              description: 'SEO Description',
              keywords: [],
            },
          };

          const results = searchContent(searchTerm, [post], []);

          // Should still find the post via title
          expect(results.posts.length).toBeGreaterThan(0);
          expect(results.posts[0].id).toBe(post.id);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle posts with empty tags array', () => {
    fc.assert(
      fc.property(
        fc.array(categoryArbitrary, { minLength: 1, maxLength: 3 }),
        fc.string({ minLength: 5, maxLength: 20 }),
        (categories, searchTerm) => {
          // Create a post with empty tags
          const post: Post = {
            id: fc.sample(fc.uuid(), 1)[0],
            slug: 'test-post',
            title: `Title with ${searchTerm}`,
            excerpt: 'Different excerpt',
            content: 'Different content',
            categoryId: categories[0].id,
            category: categories[0],
            authorId: fc.sample(fc.uuid(), 1)[0],
            tags: [], // Empty tags
            publishedAt: new Date(),
            updatedAt: new Date(),
            viewCount: 0,
            readingTimeMinutes: 5,
            seo: {
              title: 'SEO Title',
              description: 'SEO Description',
              keywords: [],
            },
          };

          const results = searchContent(searchTerm, [post], []);

          // Should still find the post via title
          expect(results.posts.length).toBeGreaterThan(0);
          expect(results.posts[0].id).toBe(post.id);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should not return duplicate results', () => {
    fc.assert(
      fc.property(testScenarioArbitrary, ({ posts, books, query }) => {
        const results = searchContent(query, posts, books);

        // Check for duplicate post IDs
        const postIds = results.posts.map((p) => p.id);
        const uniquePostIds = new Set(postIds);
        expect(postIds.length).toBe(uniquePostIds.size);

        // Check for duplicate book IDs
        const bookIds = results.books.map((b) => b.id);
        const uniqueBookIds = new Set(bookIds);
        expect(bookIds.length).toBe(uniqueBookIds.size);
      }),
      { numRuns: 100 }
    );
  });

  it('should handle special characters in query', () => {
    fc.assert(
      fc.property(
        testScenarioArbitrary,
        fc.constantFrom('C++', 'C#', '.NET', 'PLC-5', 'S7-1200', 'I/O'),
        ({ posts, books }, specialQuery) => {
          const results = searchContent(specialQuery, posts, books);

          // Should not throw errors and return valid results
          expect(results).toBeDefined();
          expect(results.totalResults).toBeGreaterThanOrEqual(0);
          expect(results.posts).toBeInstanceOf(Array);
          expect(results.books).toBeInstanceOf(Array);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle unicode characters in query', () => {
    fc.assert(
      fc.property(
        testScenarioArbitrary,
        fc.constantFrom('tự động hóa', '自動化', 'автоматизация', 'PLC'),
        ({ posts, books }, unicodeQuery) => {
          const results = searchContent(unicodeQuery, posts, books);

          // Should not throw errors and return valid results
          expect(results).toBeDefined();
          expect(results.totalResults).toBeGreaterThanOrEqual(0);
          expect(results.posts).toBeInstanceOf(Array);
          expect(results.books).toBeInstanceOf(Array);
        }
      ),
      { numRuns: 100 }
    );
  });
});
