/**
 * useSearch Hook
 * Integrates searchContent utility with debounce and state management
 * Validates Requirements: 9.1, 9.2, 9.4, 9.5
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import type { Post, Book } from '@/lib/types/domain';
import type { SearchResults } from '@/lib/data/repository';
import { searchContent } from '@/features/search/utils/searchEngine';
import { contentRepository } from '@/lib/data/factory';

/**
 * Hook return type
 */
export interface UseSearchReturn {
  /** Current search query */
  query: string;
  /** Update the search query */
  setQuery: (query: string) => void;
  /** Search results grouped by type */
  results: SearchResults;
  /** Whether a search is in progress */
  isLoading: boolean;
  /** Whether the results dropdown should be visible */
  isOpen: boolean;
  /** Close the results dropdown */
  close: () => void;
  /** Currently highlighted result index (-1 = none) */
  selectedIndex: number;
  /** Update the selected index */
  setSelectedIndex: (index: number) => void;
  /** Flat list of all results for keyboard navigation */
  flatResults: Array<{ type: 'post' | 'book'; item: Post | Book }>;
}

/**
 * Custom hook for search functionality
 *
 * Features:
 * - Debounces query by debounceMs (default 300ms)
 * - Shows results after 2+ characters
 * - Fetches all posts and books once, then filters client-side
 * - Tracks selected index for keyboard navigation
 *
 * @param debounceMs - Debounce delay in milliseconds (default 300)
 */
export function useSearch(debounceMs: number = 300): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ posts: [], books: [], totalResults: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Cache all posts and books to avoid repeated fetches
  const postsRef = useRef<Post[]>([]);
  const booksRef = useRef<Book[]>([]);
  const dataLoadedRef = useRef(false);

  // Load all posts and books once
  useEffect(() => {
    if (dataLoadedRef.current) return;

    async function loadData() {
      try {
        const [postsResult, booksResult] = await Promise.all([
          contentRepository.getPosts({ limit: 1000 }),
          contentRepository.getBooks({ limit: 1000 }),
        ]);
        postsRef.current = postsResult.data;
        booksRef.current = booksResult.data;
        dataLoadedRef.current = true;
      } catch {
        // Silently fail — search will return empty results
      }
    }

    loadData();
  }, []);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Run search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults({ posts: [], books: [], totalResults: 0 });
      setIsOpen(false);
      setIsLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    const searchResults = searchContent(debouncedQuery, postsRef.current, booksRef.current);
    setResults(searchResults);
    setIsOpen(true);
    setIsLoading(false);
    setSelectedIndex(-1);
  }, [debouncedQuery]);

  // Build flat list for keyboard navigation (posts first, then books)
  const flatResults: Array<{ type: 'post' | 'book'; item: Post | Book }> = [
    ...results.posts.map(post => ({ type: 'post' as const, item: post })),
    ...results.books.map(book => ({ type: 'book' as const, item: book })),
  ];

  const close = () => {
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    close,
    selectedIndex,
    setSelectedIndex,
    flatResults,
  };
}
