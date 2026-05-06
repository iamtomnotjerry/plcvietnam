/**
 * SearchResults Component
 * Displays grouped search results (Posts, Books) in a dropdown
 * Validates Requirements: 9.4, 9.5
 */

'use client';

import type { SearchResults as SearchResultsType } from '@/lib/data/repository';
import { SearchResultItem } from './SearchResultItem';

export interface SearchResultsProps {
  query: string;
  results: SearchResultsType;
  selectedIndex: number;
  /** Called when a result is clicked */
  onResultClick?: () => void;
}

/**
 * Renders grouped search results with section headers.
 *
 * Groups:
 * - Posts (shown first)
 * - Books (shown second)
 *
 * Empty state: "Không tìm thấy kết quả cho '[keyword]'"
 *
 * selectedIndex maps across the flat list: posts first, then books.
 */
export function SearchResults({
  query,
  results,
  selectedIndex,
  onResultClick,
}: SearchResultsProps) {
  const hasResults = results.totalResults > 0;

  if (!hasResults) {
    return (
      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
        Không tìm thấy kết quả cho &ldquo;{query}&rdquo;
      </div>
    );
  }

  // selectedIndex is a flat index: posts[0..n-1] then books[0..m-1]
  const postCount = results.posts.length;

  return (
    <div>
      {/* Posts group */}
      {results.posts.length > 0 && (
        <div>
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
            Bài viết
          </div>
          {results.posts.map((post, idx) => (
            <SearchResultItem
              key={post.id}
              type="post"
              item={post}
              isSelected={selectedIndex === idx}
              onClick={onResultClick}
            />
          ))}
        </div>
      )}

      {/* Books group */}
      {results.books.length > 0 && (
        <div>
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
            Sách
          </div>
          {results.books.map((book, idx) => (
            <SearchResultItem
              key={book.id}
              type="book"
              item={book}
              isSelected={selectedIndex === postCount + idx}
              onClick={onResultClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
