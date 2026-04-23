/**
 * useTagPosts Hook Tests
 * Unit tests for useTagPosts hook
 * Validates Requirements: 12.1, 12.2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTagPosts } from './useTagPosts';
import { contentRepository } from '@/lib/data/factory';
import type { Tag, Post } from '@/lib/types/domain';
import type { PaginatedResult } from '@/lib/data/repository';

// Mock the content repository
vi.mock('@/lib/data/factory', () => ({
  contentRepository: {
    getTagBySlug: vi.fn(),
    getPostsByTag: vi.fn(),
  },
}));

/**
 * Create a mock tag for testing
 */
function createMockTag(overrides?: Partial<Tag>): Tag {
  return {
    id: 'tag-1',
    slug: 'test-tag',
    name: 'Test Tag',
    postCount: 5,
    ...overrides,
  };
}

/**
 * Create a mock post for testing
 */
function createMockPost(overrides?: Partial<Post>): Post {
  return {
    id: 'post-1',
    slug: 'test-post',
    title: 'Test Post',
    excerpt: 'Test excerpt',
    content: '<p>Test content</p>',
    categoryId: 'cat-1',
    authorId: 'author-1',
    tags: [],
    publishedAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    viewCount: 0,
    readingTimeMinutes: 5,
    seo: {
      title: 'Test Post',
      description: 'Test description',
      keywords: [],
    },
    ...overrides,
  } as Post;
}

/**
 * Create a mock paginated result
 */
function createMockPaginatedResult(
  posts: Post[],
  page: number = 1,
  limit: number = 20
): PaginatedResult<Post> {
  return {
    data: posts,
    pagination: {
      page,
      limit,
      total: posts.length,
      totalPages: Math.ceil(posts.length / limit),
    },
  };
}

describe('useTagPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('basic functionality', () => {
    it('fetches tag and posts on mount', async () => {
      const mockTag = createMockTag();
      const mockPosts = [createMockPost(), createMockPost({ id: 'post-2' })];
      const mockResult = createMockPaginatedResult(mockPosts);

      vi.mocked(contentRepository.getTagBySlug).mockResolvedValue(mockTag);
      vi.mocked(contentRepository.getPostsByTag).mockResolvedValue(mockResult);

      const { result } = renderHook(() =>
        useTagPosts({ tagSlug: 'test-tag' })
      );

      // Initially loading
      expect(result.current.isLoading).toBe(true);
      expect(result.current.tag).toBeNull();
      expect(result.current.posts).toEqual([]);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tag).toEqual(mockTag);
      expect(result.current.posts).toEqual(mockPosts);
      expect(result.current.pagination).toEqual(mockResult.pagination);
      expect(result.current.error).toBeNull();
    });

    it('calls repository methods with correct parameters', async () => {
      const mockTag = createMockTag();
      const mockResult = createMockPaginatedResult([]);

      vi.mocked(contentRepository.getTagBySlug).mockResolvedValue(mockTag);
      vi.mocked(contentRepository.getPostsByTag).mockResolvedValue(mockResult);

      renderHook(() =>
        useTagPosts({
          tagSlug: 'test-tag',
          page: 2,
          limit: 10,
        })
      );

      await waitFor(() => {
        expect(contentRepository.getTagBySlug).toHaveBeenCalledWith('test-tag');
        expect(contentRepository.getPostsByTag).toHaveBeenCalledWith('test-tag', {
          page: 2,
          limit: 10,
        });
      });
    });

    it('uses default pagination values when not provided', async () => {
      const mockTag = createMockTag();
      const mockResult = createMockPaginatedResult([]);

      vi.mocked(contentRepository.getTagBySlug).mockResolvedValue(mockTag);
      vi.mocked(contentRepository.getPostsByTag).mockResolvedValue(mockResult);

      renderHook(() => useTagPosts({ tagSlug: 'test-tag' }));

      await waitFor(() => {
        expect(contentRepository.getPostsByTag).toHaveBeenCalledWith('test-tag', {
          page: 1,
          limit: 20,
        });
      });
    });
  });

  describe('loading states', () => {
    it('sets isLoading to true initially', () => {
      vi.mocked(contentRepository.getTagBySlug).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      vi.mocked(contentRepository.getPostsByTag).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() =>
        useTagPosts({ tagSlug: 'test-tag' })
      );

      expect(result.current.isLoading).toBe(true);
    });

    it('sets isLoading to false after successful fetch', async () => {
      const mockTag = createMockTag();
      const mockResult = createMockPaginatedResult([]);

      vi.mocked(contentRepository.getTagBySlug).mockResolvedValue(mockTag);
      vi.mocked(contentRepository.getPostsByTag).mockResolvedValue(mockResult);

      const { result } = renderHook(() =>
        useTagPosts({ tagSlug: 'test-tag' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('sets isLoading to false after error', async () => {
      vi.mocked(contentRepository.getTagBySlug).mockRejectedValue(
        new Error('Failed to fetch')
      );
      vi.mocked(contentRepository.getPostsByTag).mockRejectedValue(
        new Error('Failed to fetch')
      );

      const { result } = renderHook(() =>
        useTagPosts({ tagSlug: 'test-tag' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('error handling', () => {
    it('handles error when fetching tag fails', async () => {
      const error = new Error('Tag not found');
      vi.mocked(contentRepository.getTagBySlug).mockRejectedValue(error);
      vi.mocked(contentRepository.getPostsByTag).mockResolvedValue(
        createMockPaginatedResult([])
      );

      const { result } = renderHook(() =>
        useTagPosts({ tagSlug: 'invalid-tag' })
      );

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('handles error when fetching posts fails', async () => {
      const error = new Error('Failed to fetch posts');
      vi.mocked(contentRepository.getTagBySlug).mockResolvedValue(
        createMockTag()
      );
      vi.mocked(contentRepository.getPostsByTag).mockRejectedValue(error);

      const { result } = renderHook(() =>
        useTagPosts({ tagSlug: 'test-tag' })
      );

      await waitFor(() => {
        expect(result.current.error).toEqual(error);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('converts non-Error objects to Error instances', async () => {
      vi.mocked(contentRepository.getTagBySlug).mockRejectedValue(
        'String error'
      );
      vi.mocked(contentRepository.getPostsByTag).mockResolvedValue(
        createMockPaginatedResult([])
      );

      const { result } = renderHook(() =>
        useTagPosts({ tagSlug: 'test-tag' })
      );

      await waitFor(() => {
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe('Failed to fetch tag posts');
      });
    });

    it('clears previous error on new fetch', async () => {
      const mockTag = createMockTag();
      const mockResult = createMockPaginatedResult([]);

      // First call fails
      vi.mocked(contentRepository.getTagBySlug).mockRejectedValueOnce(
        new Error('First error')
      );
      vi.mocked(contentRepository.getPostsByTag).mockResolvedValue(mockResult);

      const { result, rerender } = renderHook(
        ({ tagSlug }) => useTagPosts({ tagSlug }),
        { initialProps: { tagSlug: 'test-tag' } }
      );

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Second call succeeds
      vi.mocked(contentRepository.getTagBySlug).mockResolvedValue(mockTag);

      rerender({ tagSlug: 'another-tag' });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('pagination', () => {
    it('returns correct pagination metadata', async () => {
      const mockTag = createMockTag();
      const mockPosts = Array.from({ length: 20 }, (_, i) =>
        createMockPost({ id: `post-${i}` })
      );
      const mockResult: PaginatedResult<Post> = {
        data: mockPosts,
        pagination: {
          page: 1,
          limit: 20,
          total: 50,
          totalPages: 3,
        },
      };

      vi.mocked(contentRepository.getTagBySlug).mockResolvedValue(mockTag);
      vi.mocked(contentRepository.getPostsByTag).mockResolvedValue(mockResult);

      const { result } = renderHook(() =>
        useTagPosts({ tagSlug: 'test-tag', page: 1, limit: 20 })
      );

      await waitFor(() => {
        expect(result.current.pagination).toEqual({
          page: 1,
          limit: 20,
          total: 50,
          totalPages: 3,
        });
      });
    });

    it('refetches when page changes', async () => {
      const mockTag = createMockTag();
      const mockResult = createMockPaginatedResult([]);

      vi.mocked(contentRepository.getTagBySlug).mockResolvedValue(mockTag);
      vi.mocked(contentRepository.getPostsByTag).mockResolvedValue(mockResult);

      const { rerender } = renderHook(
        ({ page }) => useTagPosts({ tagSlug: 'test-tag', page }),
        { initialProps: { page: 1 } }
      );

      await waitFor(() => {
        expect(contentRepository.getPostsByTag).toHaveBeenCalledWith('test-tag', {
          page: 1,
          limit: 20,
        });
      });

      rerender({ page: 2 });

      await waitFor(() => {
        expect(contentRepository.getPostsByTag).toHaveBeenCalledWith('test-tag', {
          page: 2,
          limit: 20,
        });
      });
    });

    it('refetches when limit changes', async () => {
      const mockTag = createMockTag();
      const mockResult = createMockPaginatedResult([]);

      vi.mocked(contentRepository.getTagBySlug).mockResolvedValue(mockTag);
      vi.mocked(contentRepository.getPostsByTag).mockResolvedValue(mockResult);

      const { rerender } = renderHook(
        ({ limit }) => useTagPosts({ tagSlug: 'test-tag', limit }),
        { initialProps: { limit: 20 } }
      );

      await waitFor(() => {
        expect(contentRepository.getPostsByTag).toHaveBeenCalledWith('test-tag', {
          page: 1,
          limit: 20,
        });
      });

      rerender({ limit: 10 });

      await waitFor(() => {
        expect(contentRepository.getPostsByTag).toHaveBeenCalledWith('test-tag', {
          page: 1,
          limit: 10,
        });
      });
    });
  });

  describe('tag slug changes', () => {
    it('refetches when tagSlug changes', async () => {
      const mockTag1 = createMockTag({ slug: 'tag-1', name: 'Tag 1' });
      const mockTag2 = createMockTag({ slug: 'tag-2', name: 'Tag 2' });
      const mockResult = createMockPaginatedResult([]);

      vi.mocked(contentRepository.getTagBySlug)
        .mockResolvedValueOnce(mockTag1)
        .mockResolvedValueOnce(mockTag2);
      vi.mocked(contentRepository.getPostsByTag).mockResolvedValue(mockResult);

      const { result, rerender } = renderHook(
        ({ tagSlug }) => useTagPosts({ tagSlug }),
        { initialProps: { tagSlug: 'tag-1' } }
      );

      await waitFor(() => {
        expect(result.current.tag?.name).toBe('Tag 1');
      });

      rerender({ tagSlug: 'tag-2' });

      await waitFor(() => {
        expect(result.current.tag?.name).toBe('Tag 2');
      });

      expect(contentRepository.getTagBySlug).toHaveBeenCalledTimes(2);
      expect(contentRepository.getPostsByTag).toHaveBeenCalledTimes(2);
    });
  });

  describe('cleanup', () => {
    it('does not update state after unmount', async () => {
      const mockTag = createMockTag();
      const mockResult = createMockPaginatedResult([]);

      let resolveTag: (value: Tag) => void;
      const tagPromise = new Promise<Tag>((resolve) => {
        resolveTag = resolve;
      });

      vi.mocked(contentRepository.getTagBySlug).mockReturnValue(tagPromise);
      vi.mocked(contentRepository.getPostsByTag).mockResolvedValue(mockResult);

      const { result, unmount } = renderHook(() =>
        useTagPosts({ tagSlug: 'test-tag' })
      );

      expect(result.current.isLoading).toBe(true);

      unmount();

      // Resolve after unmount
      resolveTag!(mockTag);

      // Wait a bit to ensure no state updates occur
      await new Promise((resolve) => setTimeout(resolve, 100));

      // No error should be thrown
    });
  });

  describe('parallel fetching', () => {
    it('fetches tag and posts in parallel', async () => {
      const mockTag = createMockTag();
      const mockResult = createMockPaginatedResult([]);

      let tagResolved = false;
      let postsResolved = false;

      vi.mocked(contentRepository.getTagBySlug).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        tagResolved = true;
        return mockTag;
      });

      vi.mocked(contentRepository.getPostsByTag).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        postsResolved = true;
        return mockResult;
      });

      const { result } = renderHook(() =>
        useTagPosts({ tagSlug: 'test-tag' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Both should be resolved (parallel execution)
      expect(tagResolved).toBe(true);
      expect(postsResolved).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles null tag response', async () => {
      vi.mocked(contentRepository.getTagBySlug).mockResolvedValue(null);
      vi.mocked(contentRepository.getPostsByTag).mockResolvedValue(
        createMockPaginatedResult([])
      );

      const { result } = renderHook(() =>
        useTagPosts({ tagSlug: 'nonexistent-tag' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tag).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('handles empty posts array', async () => {
      const mockTag = createMockTag();
      const mockResult = createMockPaginatedResult([]);

      vi.mocked(contentRepository.getTagBySlug).mockResolvedValue(mockTag);
      vi.mocked(contentRepository.getPostsByTag).mockResolvedValue(mockResult);

      const { result } = renderHook(() =>
        useTagPosts({ tagSlug: 'test-tag' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.posts).toEqual([]);
      expect(result.current.pagination?.total).toBe(0);
    });

    it('handles large page numbers', async () => {
      const mockTag = createMockTag();
      const mockResult = createMockPaginatedResult([]);

      vi.mocked(contentRepository.getTagBySlug).mockResolvedValue(mockTag);
      vi.mocked(contentRepository.getPostsByTag).mockResolvedValue(mockResult);

      renderHook(() =>
        useTagPosts({ tagSlug: 'test-tag', page: 999 })
      );

      await waitFor(() => {
        expect(contentRepository.getPostsByTag).toHaveBeenCalledWith('test-tag', {
          page: 999,
          limit: 20,
        });
      });
    });
  });
});
