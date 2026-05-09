/**
 * SearchResultItem Component
 * Renders a single search result (post or book)
 * Validates Requirements: 9.4, 9.5
 */

'use client';

import { Link } from '@/i18n/navigation';
import type { Post, Book } from '@/lib/types/domain';
import { bookHref, postHref } from '@/lib/utils/routes';

export interface SearchResultItemProps {
  type: 'post' | 'book';
  item: Post | Book;
  isSelected: boolean;
  onClick?: () => void;
}

/**
 * Renders a single search result row.
 *
 * Posts: show title + category breadcrumb
 * Books: show title + author name
 */
export function SearchResultItem({ type, item, isSelected, onClick }: SearchResultItemProps) {
  const baseClasses = `
    flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-150
    ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}
  `;

  if (type === 'post') {
    const post = item as Post;
    const postUrl = postHref(
      post.category?.field?.slug ?? '',
      post.category?.slug ?? '',
      post.slug
    );

    return (
      <Link href={postUrl} onClick={onClick} className={baseClasses.trim()}>
        {/* Post icon */}
        <svg
          className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
          {post.category && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {post.category.field?.name && `${post.category.field.name} › `}
              {post.category.name}
            </p>
          )}
        </div>
      </Link>
    );
  }

  const book = item as Book;

  return (
    <Link href={bookHref(book.slug)} onClick={onClick} className={baseClasses.trim()}>
      {/* Book icon */}
      <svg
        className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{book.title}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{book.authorName}</p>
      </div>
    </Link>
  );
}
