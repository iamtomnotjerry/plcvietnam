'use client';

import { useState, useEffect } from 'react';
import type { Book } from '@/lib/types/domain';
import type { PaginatedResult, BookQueryOptions } from '@/lib/data/repository';

export function useBooks(options?: BookQueryOptions) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginatedResult<Book>['pagination'] | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (options?.page) params.set('page', String(options.page));
    if (options?.limit) params.set('limit', String(options.limit));

    fetch(`/api/books?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setBooks(data.data ?? []);
        setPagination(data.pagination ?? null);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err : new Error('Failed to fetch books'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [options?.page, options?.limit, options?.series]);

  return { books, loading, error, pagination };
}

export function useFeaturedBooks(limit: number = 3) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetch(`/api/books/featured?limit=${limit}`)
      .then((r) => r.json())
      .then((data) => {
        if (mounted) setBooks(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err : new Error('Failed'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [limit]);

  return { books, loading, error };
}
