import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBooks, useFeaturedBooks } from './useBooks';
import type { Book } from '@/lib/types/domain';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const mockBooks: Book[] = [
  {
    id: 'book-1',
    slug: 'book-1',
    title: 'Book 1',
    description: 'Desc 1',
    coverImageUrl: '/img/1.jpg',
    authorName: 'Author 1',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'book-2',
    slug: 'book-2',
    title: 'Book 2',
    description: 'Desc 2',
    coverImageUrl: '/img/2.jpg',
    authorName: 'Author 2',
    createdAt: new Date('2024-01-02'),
  },
];

const mockPaginated = {
  data: mockBooks,
  pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
};

function jsonRes(data: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
  );
}

describe('useBooks', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('useBooks', () => {
    it('should fetch books successfully', async () => {
      mockFetch.mockReturnValue(jsonRes(mockPaginated));
      const { result } = renderHook(() => useBooks());
      expect(result.current.loading).toBe(true);
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.books).toHaveLength(2);
      expect(result.current.error).toBeNull();
    });

    it('should pass query options to API', async () => {
      mockFetch.mockReturnValue(jsonRes(mockPaginated));
      renderHook(() => useBooks({ page: 2, limit: 10 }));
      await waitFor(() => expect(mockFetch).toHaveBeenCalled());
      expect(mockFetch.mock.calls[0][0]).toContain('page=2');
      expect(mockFetch.mock.calls[0][0]).toContain('limit=10');
    });

    it('should handle errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useBooks());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('should refetch when options change', async () => {
      mockFetch.mockReturnValue(jsonRes(mockPaginated));
      const { rerender } = renderHook(({ page }) => useBooks({ page }), {
        initialProps: { page: 1 },
      });
      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
      rerender({ page: 2 });
      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    });

    it('should not refetch when options are the same', async () => {
      mockFetch.mockReturnValue(jsonRes(mockPaginated));
      const { rerender } = renderHook(({ page }) => useBooks({ page }), {
        initialProps: { page: 1 },
      });
      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
      rerender({ page: 1 });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('useFeaturedBooks', () => {
    it('should fetch featured books successfully', async () => {
      mockFetch.mockReturnValue(jsonRes(mockBooks));
      const { result } = renderHook(() => useFeaturedBooks(2));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.books).toHaveLength(2);
    });

    it('should pass limit to API', async () => {
      mockFetch.mockReturnValue(jsonRes(mockBooks));
      renderHook(() => useFeaturedBooks(5));
      await waitFor(() => expect(mockFetch).toHaveBeenCalled());
      expect(mockFetch.mock.calls[0][0]).toContain('limit=5');
    });

    it('should use default limit of 3', async () => {
      mockFetch.mockReturnValue(jsonRes(mockBooks));
      renderHook(() => useFeaturedBooks());
      await waitFor(() => expect(mockFetch).toHaveBeenCalled());
      expect(mockFetch.mock.calls[0][0]).toContain('limit=3');
    });

    it('should handle errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useFeaturedBooks());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('should refetch when limit changes', async () => {
      mockFetch.mockReturnValue(jsonRes(mockBooks));
      const { rerender } = renderHook(({ limit }) => useFeaturedBooks(limit), {
        initialProps: { limit: 3 },
      });
      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
      rerender({ limit: 5 });
      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
    });
  });
});
