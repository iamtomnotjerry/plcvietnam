/**
 * Books Hook
 * Fetches books with pagination and series filtering
 * Validates Requirements: 5.1, 5.4, 5.5
 */

'use client';

import { useState, useEffect } from 'react';
import type { Book } from '@/lib/types/domain';
import type { PaginatedResult, BookQueryOptions } from '@/lib/data/repository';
import { contentRepository } from '@/lib/data/factory';

/**
 * Hook for fetching books with pagination
 * 
 * @param options - Query options for filtering and pagination
 * @returns Object containing books data, loading state, error state, and pagination info
 * 
 * @example
 * ```typescript
 * const { books, loading, error, pagination } = useBooks({ page: 1, limit: 12 });
 * ```
 */
export function useBooks(options?: BookQueryOptions) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginatedResult<Book>['pagination'] | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await contentRepository.getBooks(options);

        if (isMounted) {
          setBooks(result.data);
          setPagination(result.pagination);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch books'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBooks();

    return () => {
      isMounted = false;
    };
  }, [options?.page, options?.limit, options?.series]);

  return {
    books,
    loading,
    error,
    pagination,
  };
}

/**
 * Hook for fetching featured books
 * 
 * @param limit - Maximum number of featured books to fetch (default: 3)
 * @returns Object containing featured books data, loading state, and error state
 * 
 * @example
 * ```typescript
 * const { books, loading, error } = useFeaturedBooks(3);
 * ```
 */
export function useFeaturedBooks(limit: number = 3) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await contentRepository.getFeaturedBooks(limit);

        if (isMounted) {
          setBooks(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch featured books'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFeaturedBooks();

    return () => {
      isMounted = false;
    };
  }, [limit]);

  return {
    books,
    loading,
    error,
  };
}
