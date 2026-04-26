/**
 * Property-Based Tests for Related Posts Algorithm
 * Feature: automation-blog, Property 4: Related Posts Algorithm Correctness
 *
 * **Validates: Requirements 12.4, 12.5**
 *
 * For any post and collection of posts, the related posts algorithm SHALL return posts that
 * either (a) share at least one tag with the current post, ranked by number of shared tags,
 * or (b) if no shared tags exist, return posts from the same category, and SHALL exclude
 * the current post and respect the specified limit.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { findRelatedPosts } from '../useRelatedPosts';
import { Post, Tag } from '@/lib/types/domain';

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
 * Generator for Post objects with controlled tag and category assignments
 */
const postArbitrary = (availableTags: Tag[]) =>
  fc.record({
    id: fc.uuid(),
    slug: fc.string({ minLength: 1, maxLength: 30 }),
    title: fc.string({ minLength: 5, maxLength: 100 }),
    excerpt: fc.string({ minLength: 10, maxLength: 200 }),
    content: fc.string({ minLength: 50, maxLength: 1000 }),
    thumbnailUrl: fc.option(fc.webUrl(), { nil: undefined }),
    categoryId: fc.uuid(),
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
 * Helper function to calculate expected score for a post
 */
function calculateScore(currentPost: Post, candidatePost: Post): number {
  const currentTagIds = new Set(currentPost.tags.map((t) => t.id));
  const sharedTags = candidatePost.tags.filter((tag) => currentTagIds.has(tag.id)).length;
  const isSameCategory = candidatePost.categoryId === currentPost.categoryId;

  return sharedTags * 2 + (isSameCategory ? 1 : 0);
}

/**
 * Generator for test scenario: tags, posts, current post index, and limit
 */
const testScenarioArbitrary = fc
  .array(tagArbitrary, { minLength: 1, maxLength: 10 })
  .chain((tags) =>
    fc
      .array(postArbitrary(tags), { minLength: 1, maxLength: 20 })
      .chain((posts) =>
        fc
          .integer({ min: 0, max: posts.length - 1 })
          .chain((index) =>
            fc
              .integer({ min: 1, max: 10 })
              .map((limit) => ({ currentPost: posts[index], allPosts: posts, limit }))
          )
      )
  );

describe('Property: Related Posts Algorithm Correctness', () => {
  it('should always exclude the current post from results', { timeout: 15000 }, () => {
    fc.assert(
      fc.property(testScenarioArbitrary, ({ currentPost, allPosts, limit }) => {
        const related = findRelatedPosts(currentPost, allPosts, limit);

        // Current post should never be in the results
        const containsCurrentPost = related.some((post) => post.id === currentPost.id);
        expect(containsCurrentPost).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should respect the specified limit', () => {
    fc.assert(
      fc.property(testScenarioArbitrary, ({ currentPost, allPosts, limit }) => {
        const related = findRelatedPosts(currentPost, allPosts, limit);

        // Results should not exceed the limit
        expect(related.length).toBeLessThanOrEqual(limit);
      }),
      { numRuns: 100 }
    );
  });

  it('should return posts with shared tags when available', () => {
    fc.assert(
      fc.property(testScenarioArbitrary, ({ currentPost, allPosts, limit }) => {
        const related = findRelatedPosts(currentPost, allPosts, limit);

        if (related.length > 0 && currentPost.tags.length > 0) {
          const currentTagIds = new Set(currentPost.tags.map((t) => t.id));

          // Check if any related post shares tags
          const hasSharedTags = related.some((post) =>
            post.tags.some((tag) => currentTagIds.has(tag.id))
          );

          // If there are posts with shared tags in the collection,
          // at least one result should have shared tags
          const postsWithSharedTags = allPosts.filter(
            (post) =>
              post.id !== currentPost.id && post.tags.some((tag) => currentTagIds.has(tag.id))
          );

          if (postsWithSharedTags.length > 0) {
            expect(hasSharedTags).toBe(true);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should rank posts by score (2 points per shared tag + 1 for same category)', () => {
    fc.assert(
      fc.property(testScenarioArbitrary, ({ currentPost, allPosts }) => {
        const related = findRelatedPosts(currentPost, allPosts, 10);

        // Calculate scores for all related posts
        const scores = related.map((post) => calculateScore(currentPost, post));

        // Verify posts are sorted by score descending
        for (let i = 0; i < scores.length - 1; i++) {
          expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('should sort by date descending when scores are equal', () => {
    // Generator for posts with guaranteed valid dates (no NaN)
    const validDatePostArbitrary = (availableTags: Tag[], categoryId: string) =>
      postArbitrary(availableTags)
        .filter((post) => !isNaN(post.publishedAt.getTime()))
        .map((post) => ({
          ...post,
          categoryId,
          tags: [], // No tags, so all posts will have same score (1 for same category)
        }));

    fc.assert(
      fc.property(
        fc
          .array(tagArbitrary, { minLength: 1, maxLength: 5 })
          .chain((tags) =>
            fc
              .uuid()
              .chain((categoryId) =>
                fc
                  .array(validDatePostArbitrary(tags, categoryId), { minLength: 4, maxLength: 10 })
                  .chain((posts) =>
                    fc
                      .integer({ min: 0, max: posts.length - 1 })
                      .map((index) => ({ currentPost: posts[index], allPosts: posts }))
                  )
              )
          ),
        ({ currentPost, allPosts }) => {
          const related = findRelatedPosts(currentPost, allPosts, 10);

          // All posts should have the same score (1 for same category)
          const scores = related.map((post) => calculateScore(currentPost, post));
          const allSameScore = scores.length > 0 && scores.every((score) => score === scores[0]);

          if (allSameScore && related.length > 1) {
            // Verify posts are sorted by date descending
            for (let i = 0; i < related.length - 1; i++) {
              expect(related[i].publishedAt.getTime()).toBeGreaterThanOrEqual(
                related[i + 1].publishedAt.getTime()
              );
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should fallback to same category posts when no shared tags exist', () => {
    fc.assert(
      fc.property(
        fc.array(tagArbitrary, { minLength: 5, maxLength: 10 }).chain((tags) => {
          const uniqueTags = tags.slice(0, 2);
          const otherTags = tags.slice(2);

          return fc.uuid().chain((categoryId) =>
            fc
              .tuple(
                // Current post with unique tags
                postArbitrary(tags).map((post) => ({
                  ...post,
                  categoryId,
                  tags: uniqueTags,
                })),
                // Other posts with different tags but same category
                fc.array(
                  postArbitrary(tags).chain((post) =>
                    fc.subarray(otherTags, { minLength: 0, maxLength: 3 }).map((selectedTags) => ({
                      ...post,
                      categoryId,
                      tags: selectedTags,
                    }))
                  ),
                  { minLength: 2, maxLength: 10 }
                ),
                fc.integer({ min: 1, max: 5 })
              )
              .map(([currentPost, otherPosts, limit]) => ({
                currentPost,
                allPosts: [currentPost, ...otherPosts],
                limit,
              }))
          );
        }),
        ({ currentPost, allPosts, limit }) => {
          const related = findRelatedPosts(currentPost, allPosts, limit);

          // If no posts share tags, should return posts from same category
          const currentTagIds = new Set(currentPost.tags.map((t) => t.id));
          const postsWithSharedTags = allPosts.filter(
            (post) =>
              post.id !== currentPost.id && post.tags.some((tag) => currentTagIds.has(tag.id))
          );

          if (postsWithSharedTags.length === 0 && related.length > 0) {
            // All related posts should be from same category
            related.forEach((post) => {
              expect(post.categoryId).toBe(currentPost.categoryId);
            });

            // Should be sorted by date descending (filter out invalid dates)
            const validDatePosts = related.filter((post) => !isNaN(post.publishedAt.getTime()));
            for (let i = 0; i < validDatePosts.length - 1; i++) {
              expect(validDatePosts[i].publishedAt.getTime()).toBeGreaterThanOrEqual(
                validDatePosts[i + 1].publishedAt.getTime()
              );
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return empty array when no related posts exist', () => {
    fc.assert(
      fc.property(
        fc.array(tagArbitrary, { minLength: 5, maxLength: 10 }).chain((tags) => {
          const uniqueTags = tags.slice(0, 2);
          const otherTags = tags.slice(2);

          return fc
            .tuple(
              fc.uuid(), // Unique category for current post
              fc.uuid() // Different category for other posts
            )
            .chain(([currentCategory, otherCategory]) =>
              fc
                .tuple(
                  // Current post with unique category and tags
                  postArbitrary(tags).map((post) => ({
                    ...post,
                    categoryId: currentCategory,
                    tags: uniqueTags,
                  })),
                  // Other posts with different category and different tags
                  fc.array(
                    postArbitrary(tags).chain((post) =>
                      fc
                        .subarray(otherTags, { minLength: 0, maxLength: 3 })
                        .map((selectedTags) => ({
                          ...post,
                          categoryId: otherCategory,
                          tags: selectedTags,
                        }))
                    ),
                    { minLength: 1, maxLength: 10 }
                  ),
                  fc.integer({ min: 1, max: 5 })
                )
                .map(([currentPost, otherPosts, limit]) => ({
                  currentPost,
                  allPosts: [currentPost, ...otherPosts],
                  limit,
                }))
            );
        }),
        ({ currentPost, allPosts, limit }) => {
          const related = findRelatedPosts(currentPost, allPosts, limit);

          // Verify no posts share tags or category
          const currentTagIds = new Set(currentPost.tags.map((t) => t.id));
          const hasSharedTagsOrCategory = allPosts.some(
            (post) =>
              post.id !== currentPost.id &&
              (post.tags.some((tag) => currentTagIds.has(tag.id)) ||
                post.categoryId === currentPost.categoryId)
          );

          if (!hasSharedTagsOrCategory) {
            // Should return empty array
            expect(related).toEqual([]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle posts with no tags', () => {
    fc.assert(
      fc.property(
        fc.array(tagArbitrary, { minLength: 1, maxLength: 10 }).chain((tags) =>
          fc.uuid().chain((categoryId) =>
            fc
              .array(
                postArbitrary(tags).map((post) => ({
                  ...post,
                  categoryId,
                  tags: [], // No tags
                })),
                { minLength: 3, maxLength: 10 }
              )
              .chain((posts) =>
                fc
                  .integer({ min: 0, max: posts.length - 1 })
                  .chain((index) =>
                    fc
                      .integer({ min: 1, max: 5 })
                      .map((limit) => ({ currentPost: posts[index], allPosts: posts, limit }))
                  )
              )
          )
        ),
        ({ currentPost, allPosts, limit }) => {
          const related = findRelatedPosts(currentPost, allPosts, limit);

          // With no tags, should fallback to same category
          // All related posts should be from same category
          related.forEach((post) => {
            expect(post.categoryId).toBe(currentPost.categoryId);
          });

          // Should be sorted by date descending (filter out invalid dates)
          const validDatePosts = related.filter((post) => !isNaN(post.publishedAt.getTime()));
          for (let i = 0; i < validDatePosts.length - 1; i++) {
            expect(validDatePosts[i].publishedAt.getTime()).toBeGreaterThanOrEqual(
              validDatePosts[i + 1].publishedAt.getTime()
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle single post collection (only current post)', () => {
    fc.assert(
      fc.property(
        fc.array(tagArbitrary, { minLength: 1, maxLength: 5 }).chain((tags) =>
          postArbitrary(tags).chain((post) =>
            fc.integer({ min: 1, max: 5 }).map((limit) => ({
              currentPost: post,
              allPosts: [post],
              limit,
            }))
          )
        ),
        ({ currentPost, allPosts, limit }) => {
          const related = findRelatedPosts(currentPost, allPosts, limit);

          // Should return empty array (only post is the current post)
          expect(related).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce consistent results for the same input', () => {
    fc.assert(
      fc.property(testScenarioArbitrary, ({ currentPost, allPosts, limit }) => {
        const related1 = findRelatedPosts(currentPost, allPosts, limit);
        const related2 = findRelatedPosts(currentPost, allPosts, limit);

        // Same input should always produce same output (determinism)
        expect(related1).toEqual(related2);
      }),
      { numRuns: 100 }
    );
  });

  it('should only return posts from the input collection', () => {
    fc.assert(
      fc.property(testScenarioArbitrary, ({ currentPost, allPosts, limit }) => {
        const related = findRelatedPosts(currentPost, allPosts, limit);

        // All related posts should be from the input collection
        const allPostIds = new Set(allPosts.map((p) => p.id));
        related.forEach((post) => {
          expect(allPostIds.has(post.id)).toBe(true);
        });
      }),
      { numRuns: 100 }
    );
  });

  it('should handle posts with many shared tags correctly', () => {
    fc.assert(
      fc.property(
        fc.array(tagArbitrary, { minLength: 5, maxLength: 10 }).chain((tags) =>
          fc.uuid().chain((categoryId) =>
            fc
              .tuple(
                // Current post with all tags
                postArbitrary(tags).map((post) => ({
                  ...post,
                  categoryId,
                  tags: tags,
                })),
                // Other posts with varying numbers of shared tags
                fc.array(
                  postArbitrary(tags).chain((post) =>
                    fc.integer({ min: 0, max: tags.length }).map((numSharedTags) => ({
                      ...post,
                      categoryId,
                      tags: tags.slice(0, numSharedTags),
                    }))
                  ),
                  { minLength: 3, maxLength: 10 }
                ),
                fc.integer({ min: 2, max: 5 })
              )
              .map(([currentPost, otherPosts, limit]) => ({
                currentPost,
                allPosts: [currentPost, ...otherPosts],
                limit,
              }))
          )
        ),
        ({ currentPost, allPosts, limit }) => {
          const related = findRelatedPosts(currentPost, allPosts, limit);

          // Verify posts are sorted by number of shared tags
          const currentTagIds = new Set(currentPost.tags.map((t) => t.id));
          const sharedTagCounts = related.map(
            (post) => post.tags.filter((tag) => currentTagIds.has(tag.id)).length
          );

          // Verify descending order of shared tag counts
          for (let i = 0; i < sharedTagCounts.length - 1; i++) {
            expect(sharedTagCounts[i]).toBeGreaterThanOrEqual(sharedTagCounts[i + 1]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle limit of 0', () => {
    fc.assert(
      fc.property(
        fc
          .array(tagArbitrary, { minLength: 1, maxLength: 10 })
          .chain((tags) =>
            fc
              .array(postArbitrary(tags), { minLength: 2, maxLength: 20 })
              .chain((posts) =>
                fc
                  .integer({ min: 0, max: posts.length - 1 })
                  .map((index) => ({ currentPost: posts[index], allPosts: posts }))
              )
          ),
        ({ currentPost, allPosts }) => {
          const related = findRelatedPosts(currentPost, allPosts, 0);

          // With limit 0, should return empty array
          expect(related).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle large limit (greater than available posts)', () => {
    fc.assert(
      fc.property(
        fc
          .array(tagArbitrary, { minLength: 1, maxLength: 10 })
          .chain((tags) =>
            fc
              .array(postArbitrary(tags), { minLength: 2, maxLength: 10 })
              .chain((posts) =>
                fc
                  .integer({ min: 0, max: posts.length - 1 })
                  .map((index) => ({ currentPost: posts[index], allPosts: posts }))
              )
          ),
        ({ currentPost, allPosts }) => {
          const largeLimit = 1000;
          const related = findRelatedPosts(currentPost, allPosts, largeLimit);

          // Should return at most (allPosts.length - 1) posts (excluding current)
          expect(related.length).toBeLessThanOrEqual(allPosts.length - 1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
