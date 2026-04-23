/**
 * SearchInput Component
 * Global search with live results, debounce, and keyboard navigation
 * Validates Requirements: 9.1, 9.2, 9.4, 9.5
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Post, Book } from '@/lib/types/domain';
import { useSearch } from '@/features/search/hooks/useSearch';
import { SearchResults } from './SearchResults';
import { bookHref, postHref } from '@/lib/utils/routes';

export interface SearchInputProps {
  /** 'navbar' = inline dropdown, 'overlay' = full-screen on mobile */
  variant?: 'navbar' | 'overlay';
  /** Called when a result is clicked (e.g. close overlay) */
  onResultClick?: () => void;
  /** Debounce delay in ms (default 300) */
  debounceMs?: number;
}

/**
 * SearchInput Component
 *
 * Behavior:
 * - Debounces input (debounceMs, default 300ms)
 * - Shows results dropdown after 2+ characters
 * - Groups results by type (Posts, Books)
 * - Keyboard navigation: Arrow Up/Down, Enter, Escape
 * - Mobile (overlay variant): full-screen with backdrop
 * - Empty state: "Không tìm thấy kết quả cho '[keyword]'"
 */
export function SearchInput({
  variant = 'navbar',
  onResultClick,
  debounceMs = 300,
}: SearchInputProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    close,
    selectedIndex,
    setSelectedIndex,
    flatResults,
  } = useSearch(debounceMs);

  /**
   * Navigate to the selected result
   */
  const navigateToResult = useCallback(
    (entry: { type: 'post' | 'book'; item: Post | Book }) => {
      if (entry.type === 'post') {
        const post = entry.item as Post;
        const fs = post.category?.field?.slug ?? '';
        const cs = post.category?.slug ?? '';
        router.push(postHref(fs, cs, post.slug));
      } else {
        const book = entry.item as Book;
        router.push(bookHref(book.slug));
      }
      close();
      onResultClick?.();
    },
    [router, close, onResultClick]
  );

  /**
   * Keyboard handler: Arrow Up/Down, Enter, Escape
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(Math.min(selectedIndex + 1, flatResults.length - 1));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(Math.max(selectedIndex - 1, -1));
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && flatResults[selectedIndex]) {
            navigateToResult(flatResults[selectedIndex]);
          }
          break;

        case 'Escape':
          e.preventDefault();
          close();
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, selectedIndex, flatResults, setSelectedIndex, navigateToResult, close]
  );

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close]);

  /**
   * Handle result click: close and call callback
   */
  const handleResultClick = useCallback(() => {
    close();
    onResultClick?.();
  }, [close, onResultClick]);

  // ── Overlay variant (mobile full-screen) ──────────────────────────────────
  if (variant === 'overlay') {
    return (
      <div ref={containerRef} className="relative w-full">
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={close}
            aria-hidden="true"
          />
        )}

        {/* Search input */}
        <div className="relative z-50">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="search"
              role="combobox"
              aria-expanded={isOpen}
              aria-autocomplete="list"
              aria-label="Tìm kiếm"
              placeholder="Tìm kiếm bài viết, sách..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg
                  className="w-4 h-4 animate-spin text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Results dropdown */}
          {isOpen && (
            <div
              role="listbox"
              className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden max-h-[70vh] overflow-y-auto z-50"
            >
              <SearchResults
                query={query}
                results={results}
                selectedIndex={selectedIndex}
                onResultClick={handleResultClick}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Navbar variant (inline dropdown) ─────────────────────────────────────
  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-label="Tìm kiếm"
          placeholder="Tìm kiếm..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-9 pr-4 py-2 bg-muted border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-background transition-colors duration-200"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="w-3.5 h-3.5 animate-spin text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden max-h-[400px] overflow-y-auto z-50 min-w-[320px]"
        >
          <SearchResults
            query={query}
            results={results}
            selectedIndex={selectedIndex}
            onResultClick={handleResultClick}
          />
        </div>
      )}
    </div>
  );
}
