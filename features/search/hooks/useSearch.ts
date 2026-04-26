'use client';

import { useState, useEffect } from 'react';
import type { Post, Book } from '@/lib/types/domain';
import type { SearchResults } from '@/lib/data/repository';

export interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResults;
  isLoading: boolean;
  isOpen: boolean;
  close: () => void;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  flatResults: Array<{ type: 'post' | 'book'; item: Post | Book }>;
}

export function useSearch(debounceMs: number = 300): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ posts: [], books: [], totalResults: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Reset selectedIndex immediately when query changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  // Search via API
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults({ posts: [], books: [], totalResults: 0 });
      setIsOpen(false);
      setIsLoading(false);
      setSelectedIndex(-1);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      })
      .catch(() => {
        if (!cancelled) setResults({ posts: [], books: [], totalResults: 0 });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const flatResults: Array<{ type: 'post' | 'book'; item: Post | Book }> = [
    ...results.posts.map((post) => ({ type: 'post' as const, item: post })),
    ...results.books.map((book) => ({ type: 'book' as const, item: book })),
  ];

  return {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    close: () => {
      setIsOpen(false);
      setSelectedIndex(-1);
    },
    selectedIndex,
    setSelectedIndex,
    flatResults,
  };
}
