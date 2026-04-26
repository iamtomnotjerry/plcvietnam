import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTagPosts } from './useTagPosts';
import type { Tag, Post } from '@/lib/types/domain';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockTag: Tag = { id: 'tag-1', slug: 'test-tag', name: 'Test Tag', postCount: 5 };
const mockPost: Post = {
  id: 'post-1',
  slug: 'test-post',
  title: 'Test Post',
  excerpt: 'Excerpt',
  content: '<p>Content</p>',
  categoryId: 'cat-1',
  authorId: 'author-1',
  tags: [],
  publishedAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  viewCount: 0,
  readingTimeMinutes: 3,
  seo: { title: 'Test', description: 'Desc', keywords: [] },
};
const mockPaginated = {
  data: [mockPost],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

function jsonRes(data: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
  );
}

describe('useTagPosts', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('basic functionality', () => {
    it('fetches tag and posts on mount', async () => {
      mockFetch.mockReturnValueOnce(jsonRes(mockTag)).mockReturnValueOnce(jsonRes(mockPaginated));
      const { result } = renderHook(() => useTagPosts({ tagSlug: 'test-tag' }));
      expect(result.current.isLoading).toBe(true);
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.tag).toEqual(mockTag);
      expect(result.current.posts).toHaveLength(1);
    });

    it('calls API with correct parameters', async () => {
      mockFetch.mockReturnValue(jsonRes(mockPaginated));
      renderHook(() => useTagPosts({ tagSlug: 'my-tag', page: 2, limit: 10 }));
      await waitFor(() => expect(mockFetch).toHaveBeenCalled());
      const calls = mockFetch.mock.calls.map((c: any[]) => c[0] as string);
      expect(calls.some((url) => url.includes('my-tag'))).toBe(true);
    });

    it('uses default pagination values when not provided', async () => {
      mockFetch.mockReturnValue(jsonRes(mockPaginated));
      renderHook(() => useTagPosts({ tagSlug: 'test-tag' }));
      await waitFor(() => expect(mockFetch).toHaveBeenCalled());
      const calls = mockFetch.mock.calls.map((c: any[]) => c[0] as string);
      expect(calls.some((url) => url.includes('page=1'))).toBe(true);
    });
  });

  describe('error handling', () => {
    it('handles fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useTagPosts({ tagSlug: 'test-tag' }));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('handles error when fetching tag fails', async () => {
      mockFetch.mockRejectedValue(new Error('Tag not found'));
      const { result } = renderHook(() => useTagPosts({ tagSlug: 'bad-tag' }));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.error).toBeTruthy();
    });

    it('handles error when fetching posts fails', async () => {
      mockFetch.mockRejectedValue(new Error('Posts error'));
      const { result } = renderHook(() => useTagPosts({ tagSlug: 'test-tag' }));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.error).toBeTruthy();
    });

    it('converts non-Error objects to Error instances', async () => {
      mockFetch.mockRejectedValue('string error');
      const { result } = renderHook(() => useTagPosts({ tagSlug: 'test-tag' }));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('pagination', () => {
    it('returns correct pagination metadata', async () => {
      mockFetch
        .mockReturnValueOnce(jsonRes(mockTag))
        .mockReturnValueOnce(
          jsonRes({
            data: [mockPost],
            pagination: { page: 2, limit: 10, total: 25, totalPages: 3 },
          })
        );
      const { result } = renderHook(() => useTagPosts({ tagSlug: 'test-tag', page: 2, limit: 10 }));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.pagination?.totalPages).toBe(3);
    });

    it('refetches when page changes', async () => {
      mockFetch.mockReturnValue(jsonRes(mockPaginated));
      const { rerender } = renderHook(({ page }) => useTagPosts({ tagSlug: 'test-tag', page }), {
        initialProps: { page: 1 },
      });
      await waitFor(() => expect(mockFetch).toHaveBeenCalled());
      const callCount = mockFetch.mock.calls.length;
      rerender({ page: 2 });
      await waitFor(() => expect(mockFetch.mock.calls.length).toBeGreaterThan(callCount));
    });

    it('refetches when limit changes', async () => {
      mockFetch.mockReturnValue(jsonRes(mockPaginated));
      const { rerender } = renderHook(({ limit }) => useTagPosts({ tagSlug: 'test-tag', limit }), {
        initialProps: { limit: 10 },
      });
      await waitFor(() => expect(mockFetch).toHaveBeenCalled());
      const callCount = mockFetch.mock.calls.length;
      rerender({ limit: 20 });
      await waitFor(() => expect(mockFetch.mock.calls.length).toBeGreaterThan(callCount));
    });
  });

  describe('tag slug changes', () => {
    it('refetches when tagSlug changes', async () => {
      mockFetch.mockReturnValue(jsonRes(mockPaginated));
      const { rerender } = renderHook(({ slug }) => useTagPosts({ tagSlug: slug }), {
        initialProps: { slug: 'tag-1' },
      });
      await waitFor(() => expect(mockFetch).toHaveBeenCalled());
      const callCount = mockFetch.mock.calls.length;
      rerender({ slug: 'tag-2' });
      await waitFor(() => expect(mockFetch.mock.calls.length).toBeGreaterThan(callCount));
    });
  });

  describe('parallel fetching', () => {
    it('fetches tag and posts in parallel', async () => {
      mockFetch.mockReturnValueOnce(jsonRes(mockTag)).mockReturnValueOnce(jsonRes(mockPaginated));
      const { result } = renderHook(() => useTagPosts({ tagSlug: 'test-tag' }));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases', () => {
    it('handles null tag response', async () => {
      mockFetch
        .mockReturnValueOnce(jsonRes({ error: 'Not found' }, 404))
        .mockReturnValueOnce(jsonRes(mockPaginated));
      const { result } = renderHook(() => useTagPosts({ tagSlug: 'missing' }));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.tag).toBeNull();
    });

    it('handles empty posts array', async () => {
      mockFetch
        .mockReturnValueOnce(jsonRes(mockTag))
        .mockReturnValueOnce(
          jsonRes({ data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } })
        );
      const { result } = renderHook(() => useTagPosts({ tagSlug: 'empty-tag' }));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.posts).toHaveLength(0);
    });

    it('handles large page numbers', async () => {
      mockFetch.mockReturnValue(
        jsonRes({ data: [], pagination: { page: 999, limit: 20, total: 0, totalPages: 0 } })
      );
      const { result } = renderHook(() => useTagPosts({ tagSlug: 'test-tag', page: 999 }));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.posts).toHaveLength(0);
    });
  });
});
