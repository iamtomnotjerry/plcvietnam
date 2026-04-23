/**
 * Tests for Related Posts Algorithm
 * Validates Requirements 12.4, 12.5
 */

import { describe, it, expect } from 'vitest';
import { findRelatedPosts } from './useRelatedPosts';
import { Post } from '@/lib/types/domain';

// Helper function to create a mock post
function createMockPost(
  id: string,
  categoryId: string,
  tagIds: string[],
  publishedAt: Date
): Post {
  return {
    id,
    slug: `post-${id}`,
    title: `Post ${id}`,
    excerpt: `Excerpt for post ${id}`,
    content: `Content for post ${id}`,
    categoryId,
    tags: tagIds.map(tagId => ({
      id: tagId,
      slug: `tag-${tagId}`,
      name: `Tag ${tagId}`,
      postCount: 1
    })),
    authorId: 'author-1',
    publishedAt,
    updatedAt: publishedAt,
    viewCount: 0,
    readingTimeMinutes: 5,
    seo: {
      title: `Post ${id}`,
      description: `Description for post ${id}`,
      keywords: []
    }
  } as Post;
}

describe('findRelatedPosts', () => {
  describe('basic functionality', () => {
    it('excludes the current post from results', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1'], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        createMockPost('2', 'cat-1', ['tag-1'], new Date('2024-01-02')),
        createMockPost('3', 'cat-1', ['tag-1'], new Date('2024-01-03'))
      ];

      const related = findRelatedPosts(currentPost, allPosts, 5);

      expect(related).not.toContainEqual(currentPost);
      expect(related.every(post => post.id !== currentPost.id)).toBe(true);
    });

    it('respects the limit parameter', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1'], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        createMockPost('2', 'cat-1', ['tag-1'], new Date('2024-01-02')),
        createMockPost('3', 'cat-1', ['tag-1'], new Date('2024-01-03')),
        createMockPost('4', 'cat-1', ['tag-1'], new Date('2024-01-04')),
        createMockPost('5', 'cat-1', ['tag-1'], new Date('2024-01-05'))
      ];

      const related = findRelatedPosts(currentPost, allPosts, 2);

      expect(related).toHaveLength(2);
    });

    it('returns empty array when no other posts exist', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1'], new Date('2024-01-01'));
      const allPosts = [currentPost];

      const related = findRelatedPosts(currentPost, allPosts, 5);

      expect(related).toEqual([]);
    });
  });

  describe('scoring by shared tags', () => {
    it('prioritizes posts with more shared tags', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1', 'tag-2', 'tag-3'], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        createMockPost('2', 'cat-2', ['tag-1'], new Date('2024-01-02')), // 1 shared tag = 2 points
        createMockPost('3', 'cat-2', ['tag-1', 'tag-2'], new Date('2024-01-03')), // 2 shared tags = 4 points
        createMockPost('4', 'cat-2', ['tag-1', 'tag-2', 'tag-3'], new Date('2024-01-04')) // 3 shared tags = 6 points
      ];

      const related = findRelatedPosts(currentPost, allPosts, 5);

      // Should be ordered by number of shared tags (descending)
      expect(related[0].id).toBe('4'); // 3 shared tags
      expect(related[1].id).toBe('3'); // 2 shared tags
      expect(related[2].id).toBe('2'); // 1 shared tag
    });

    it('gives 2 points per shared tag', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1', 'tag-2'], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        createMockPost('2', 'cat-2', ['tag-1'], new Date('2024-01-02')), // 2 points
        createMockPost('3', 'cat-2', ['tag-1', 'tag-2'], new Date('2024-01-03')) // 4 points
      ];

      const related = findRelatedPosts(currentPost, allPosts, 5);

      // Post with 2 shared tags should come first
      expect(related[0].id).toBe('3');
      expect(related[1].id).toBe('2');
    });
  });

  describe('scoring by same category', () => {
    it('gives 1 point for same category', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1'], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        createMockPost('2', 'cat-2', ['tag-1'], new Date('2024-01-02')), // 2 points (1 tag)
        createMockPost('3', 'cat-1', ['tag-1'], new Date('2024-01-03')) // 3 points (1 tag + same category)
      ];

      const related = findRelatedPosts(currentPost, allPosts, 5);

      // Post with same category should come first
      expect(related[0].id).toBe('3');
      expect(related[1].id).toBe('2');
    });

    it('combines tag score and category score', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1', 'tag-2'], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        createMockPost('2', 'cat-2', ['tag-1', 'tag-2'], new Date('2024-01-02')), // 4 points (2 tags)
        createMockPost('3', 'cat-1', ['tag-1'], new Date('2024-01-03')) // 3 points (1 tag + category)
      ];

      const related = findRelatedPosts(currentPost, allPosts, 5);

      // Post with more shared tags should come first despite different category
      expect(related[0].id).toBe('2'); // 4 points
      expect(related[1].id).toBe('3'); // 3 points
    });
  });

  describe('sorting by publication date', () => {
    it('sorts by date descending when scores are equal', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1'], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        createMockPost('2', 'cat-2', ['tag-1'], new Date('2024-01-02')), // Same score, older
        createMockPost('3', 'cat-2', ['tag-1'], new Date('2024-01-05')), // Same score, newer
        createMockPost('4', 'cat-2', ['tag-1'], new Date('2024-01-03')) // Same score, middle
      ];

      const related = findRelatedPosts(currentPost, allPosts, 5);

      // Should be ordered by date descending when scores are equal
      expect(related[0].id).toBe('3'); // 2024-01-05
      expect(related[1].id).toBe('4'); // 2024-01-03
      expect(related[2].id).toBe('2'); // 2024-01-02
    });

    it('prioritizes score over date', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1', 'tag-2'], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        createMockPost('2', 'cat-2', ['tag-1'], new Date('2024-01-10')), // 2 points, newest
        createMockPost('3', 'cat-2', ['tag-1', 'tag-2'], new Date('2024-01-02')) // 4 points, oldest
      ];

      const related = findRelatedPosts(currentPost, allPosts, 5);

      // Higher score should come first regardless of date
      expect(related[0].id).toBe('3'); // 4 points
      expect(related[1].id).toBe('2'); // 2 points
    });
  });

  describe('fallback to same category', () => {
    it('returns recent posts from same category when no shared tags', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1'], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        createMockPost('2', 'cat-1', ['tag-2'], new Date('2024-01-02')), // Same category, no shared tags
        createMockPost('3', 'cat-1', ['tag-3'], new Date('2024-01-05')), // Same category, no shared tags
        createMockPost('4', 'cat-2', ['tag-4'], new Date('2024-01-10')) // Different category
      ];

      const related = findRelatedPosts(currentPost, allPosts, 5);

      // Should return posts from same category, sorted by date descending
      expect(related).toHaveLength(2);
      expect(related[0].id).toBe('3'); // Newer
      expect(related[1].id).toBe('2'); // Older
      expect(related.every(post => post.categoryId === 'cat-1')).toBe(true);
    });

    it('respects limit in fallback mode', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1'], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        createMockPost('2', 'cat-1', ['tag-2'], new Date('2024-01-02')),
        createMockPost('3', 'cat-1', ['tag-3'], new Date('2024-01-03')),
        createMockPost('4', 'cat-1', ['tag-4'], new Date('2024-01-04')),
        createMockPost('5', 'cat-1', ['tag-5'], new Date('2024-01-05'))
      ];

      const related = findRelatedPosts(currentPost, allPosts, 2);

      expect(related).toHaveLength(2);
    });

    it('returns empty array when no posts in same category and no shared tags', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1'], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        createMockPost('2', 'cat-2', ['tag-2'], new Date('2024-01-02')),
        createMockPost('3', 'cat-3', ['tag-3'], new Date('2024-01-03'))
      ];

      const related = findRelatedPosts(currentPost, allPosts, 5);

      expect(related).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('handles posts with no tags', () => {
      const currentPost = createMockPost('1', 'cat-1', [], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        createMockPost('2', 'cat-1', [], new Date('2024-01-02')),
        createMockPost('3', 'cat-1', ['tag-1'], new Date('2024-01-03'))
      ];

      const related = findRelatedPosts(currentPost, allPosts, 5);

      // Should fall back to same category posts
      expect(related).toHaveLength(2);
      expect(related.every(post => post.categoryId === 'cat-1')).toBe(true);
    });

    it('handles limit of 0', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1'], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        createMockPost('2', 'cat-1', ['tag-1'], new Date('2024-01-02'))
      ];

      const related = findRelatedPosts(currentPost, allPosts, 0);

      expect(related).toEqual([]);
    });

    it('handles limit larger than available posts', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1'], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        createMockPost('2', 'cat-1', ['tag-1'], new Date('2024-01-02')),
        createMockPost('3', 'cat-1', ['tag-1'], new Date('2024-01-03'))
      ];

      const related = findRelatedPosts(currentPost, allPosts, 100);

      expect(related).toHaveLength(2); // Only 2 other posts available
    });

    it('handles posts with duplicate tag IDs', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1', 'tag-1'], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        createMockPost('2', 'cat-2', ['tag-1'], new Date('2024-01-02'))
      ];

      const related = findRelatedPosts(currentPost, allPosts, 5);

      // Should handle duplicates gracefully
      expect(related).toHaveLength(1);
      expect(related[0].id).toBe('2');
    });
  });

  describe('complex scenarios', () => {
    it('handles mixed scoring scenarios correctly', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1', 'tag-2', 'tag-3'], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        createMockPost('2', 'cat-1', ['tag-1', 'tag-2', 'tag-3'], new Date('2024-01-02')), // 7 points (3 tags + category)
        createMockPost('3', 'cat-2', ['tag-1', 'tag-2', 'tag-3'], new Date('2024-01-03')), // 6 points (3 tags)
        createMockPost('4', 'cat-1', ['tag-1', 'tag-2'], new Date('2024-01-04')), // 5 points (2 tags + category)
        createMockPost('5', 'cat-2', ['tag-1', 'tag-2'], new Date('2024-01-05')), // 4 points (2 tags)
        createMockPost('6', 'cat-1', ['tag-1'], new Date('2024-01-06')), // 3 points (1 tag + category)
        createMockPost('7', 'cat-2', ['tag-1'], new Date('2024-01-07')) // 2 points (1 tag)
      ];

      const related = findRelatedPosts(currentPost, allPosts, 10);

      // Verify correct ordering by score
      expect(related[0].id).toBe('2'); // 7 points
      expect(related[1].id).toBe('3'); // 6 points
      expect(related[2].id).toBe('4'); // 5 points
      expect(related[3].id).toBe('5'); // 4 points
      expect(related[4].id).toBe('6'); // 3 points
      expect(related[5].id).toBe('7'); // 2 points
    });

    it('handles date tiebreakers in complex scenarios', () => {
      const currentPost = createMockPost('1', 'cat-1', ['tag-1'], new Date('2024-01-01'));
      const allPosts = [
        currentPost,
        // All have same score (2 points), different dates
        createMockPost('2', 'cat-2', ['tag-1'], new Date('2024-01-02')),
        createMockPost('3', 'cat-2', ['tag-1'], new Date('2024-01-10')),
        createMockPost('4', 'cat-2', ['tag-1'], new Date('2024-01-05')),
        createMockPost('5', 'cat-2', ['tag-1'], new Date('2024-01-08')),
        createMockPost('6', 'cat-2', ['tag-1'], new Date('2024-01-03'))
      ];

      const related = findRelatedPosts(currentPost, allPosts, 10);

      // Should be ordered by date descending
      expect(related[0].id).toBe('3'); // 2024-01-10
      expect(related[1].id).toBe('5'); // 2024-01-08
      expect(related[2].id).toBe('4'); // 2024-01-05
      expect(related[3].id).toBe('6'); // 2024-01-03
      expect(related[4].id).toBe('2'); // 2024-01-02
    });
  });
});
