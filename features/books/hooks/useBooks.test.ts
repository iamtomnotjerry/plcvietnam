/**
 * useBooks Hook Tests
 * Validates Requirements: 5.1, 5.4, 5.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBooks, useFeaturedBooks } from './useBooks';
import type { Book } from '@/lib/types/domain';
import type { PaginatedResult } from '@/lib/data/repository';

// Mock the content repository
vi.mock('@/lib/data/factory', () => ({
  contentRepository: {
    getBooks: vi.fn(),
    getFeaturedBooks: vi.fn(),
  },
}));

import { contentRepository } from '@/lib/data/factory';

describe('useBooks', () => {
  const mockBooks: Book[] = [
    {
      id: 'book-1',
      slug: 'book-1',
      title: 'Book 1',
      description: 'Description 1',
      coverImageUrl: '/images/book1.jpg',
      authorName: 'Author 1',
      series: 'Series A',
      downloadUrl: '/downloads/book1.pdf',
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'book-2',
      slug: 'book-2',
      title: 'Book 2',
      description: 'Description 2',
      coverImageUrl: '/images/book2.jpg',
      authorName: 'Author 2',
      downloadUrl: '/downloads/book2.pdf',
      createdAt: new Date('2024-01-02'),
    },
  ];

  const mockPaginatedResult: PaginatedResult<Book> = {
    data: mockBooks,
    pagination: {
      page: 1,
      limit: 12,
      total: 2,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useBooks', () => {
    it('should fetch books successfully', async () => {
      vi.mocked(contentRepository.getBooks).mockResolvedValue(mockPaginatedResult);

      const { result } = renderHook(() => useBooks());

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.books).toEqual([]);
      expect(result.current.error).toBeNull();

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.books).toEqual(mockBooks);
      expect(result.current.pagination).toEqual(mockPaginatedResult.pagination);
      expect(result.current.error).toBeNull();
    });

    it('should pass query options to repository', async () => {
      vi.mocked(contentRepository.getBooks).mockResolvedValue(mockPaginatedResult);

      const options = { page: 2, limit: 12, series: 'Series A' };
      renderHook(() => useBooks(options));

      await waitFor(() => {
        expect(contentRepository.getBooks).toHaveBeenCalledWith(options);
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Failed to fetch books');
      vi.mocked(contentRepository.getBooks).mockRejectedValue(error);

      const { result } = renderHook(() => useBooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.books).toEqual([]);
    });

    it('should refetch when options change', async () => {
      vi.mocked(contentRepository.getBooks).mockResolvedValue(mockPaginatedResult);

      const { rerender } = renderHook(
        ({ options }) => useBooks(options),
        {
          initialProps: { options: { page: 1, limit: 12 } },
        }
      );

      await waitFor(() => {
        expect(contentRepository.getBooks).toHaveBeenCalledTimes(1);
      });

      // Change page
      rerender({ options: { page: 2, limit: 12 } });

      await waitFor(() => {
        expect(contentRepository.getBooks).toHaveBeenCalledTimes(2);
      });
    });

    it('should not refetch when options are the same', async () => {
      vi.mocked(contentRepository.getBooks).mockResolvedValue(mockPaginatedResult);

      const { rerender } = renderHook(
        ({ options }) => useBooks(options),
        {
          initialProps: { options: { page: 1, limit: 12 } },
        }
      );

      await waitFor(() => {
        expect(contentRepository.getBooks).toHaveBeenCalledTimes(1);
      });

      // Rerender with same options
      rerender({ options: { page: 1, limit: 12 } });

      // Should not refetch
      expect(contentRepository.getBooks).toHaveBeenCalledTimes(1);
    });

    it('should cleanup on unmount', async () => {
      vi.mocked(contentRepository.getBooks).mockResolvedValue(mockPaginatedResult);

      const { unmount } = renderHook(() => useBooks());

      unmount();

      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('useFeaturedBooks', () => {
    it('should fetch featured books successfully', async () => {
      vi.mocked(contentRepository.getFeaturedBooks).mockResolvedValue(mockBooks);

      const { result } = renderHook(() => useFeaturedBooks(3));

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.books).toEqual([]);
      expect(result.current.error).toBeNull();

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.books).toEqual(mockBooks);
      expect(result.current.error).toBeNull();
    });

    it('should pass limit to repository', async () => {
      vi.mocked(contentRepository.getFeaturedBooks).mockResolvedValue(mockBooks);

      renderHook(() => useFeaturedBooks(5));

      await waitFor(() => {
        expect(contentRepository.getFeaturedBooks).toHaveBeenCalledWith(5);
      });
    });

    it('should use default limit of 3', async () => {
      vi.mocked(contentRepository.getFeaturedBooks).mockResolvedValue(mockBooks);

      renderHook(() => useFeaturedBooks());

      await waitFor(() => {
        expect(contentRepository.getFeaturedBooks).toHaveBeenCalledWith(3);
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Failed to fetch featured books');
      vi.mocked(contentRepository.getFeaturedBooks).mockRejectedValue(error);

      const { result } = renderHook(() => useFeaturedBooks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.books).toEqual([]);
    });

    it('should refetch when limit changes', async () => {
      vi.mocked(contentRepository.getFeaturedBooks).mockResolvedValue(mockBooks);

      const { rerender } = renderHook(
        ({ limit }) => useFeaturedBooks(limit),
        {
          initialProps: { limit: 3 },
        }
      );

      await waitFor(() => {
        expect(contentRepository.getFeaturedBooks).toHaveBeenCalledTimes(1);
      });

      // Change limit
      rerender({ limit: 5 });

      await waitFor(() => {
        expect(contentRepository.getFeaturedBooks).toHaveBeenCalledTimes(2);
      });
    });
  });
});
