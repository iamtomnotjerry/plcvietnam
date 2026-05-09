/**
 * PostList Component
 * Display paginated list of posts
 * Validates Requirements: 2.1, 2.5
 */

'use client';

import { useTranslations } from 'next-intl';
import { PostCard } from './PostCard';
import type { Post } from '@/lib/types/domain';

export interface PostListProps {
  posts: Post[];
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  variant?: 'default' | 'compact' | 'featured';
  showCategory?: boolean;
  showThumbnail?: boolean;
}

/**
 * PostList Component
 *
 * Displays a grid of post cards with optional pagination
 * - Grid layout: 3 columns on desktop, 2 on tablet, 1 on mobile
 * - Pagination: 20 posts per page (configurable)
 * - Empty state when no posts available
 */
export function PostList({
  posts,
  pagination,
  variant = 'default',
  showCategory = true,
  showThumbnail = true,
}: PostListProps) {
  const t = useTranslations('posts');
  const tCommon = useTranslations('common');

  /**
   * Render pagination controls
   */
  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { page, totalPages, onPageChange } = pagination;

    // Generate page numbers to display
    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisible = 7; // Show max 7 page buttons

      if (totalPages <= maxVisible) {
        // Show all pages if total is small
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first, last, current, and nearby pages with ellipsis
        pages.push(1);

        if (page > 3) {
          pages.push('...');
        }

        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
          pages.push(i);
        }

        if (page < totalPages - 2) {
          pages.push('...');
        }

        pages.push(totalPages);
      }

      return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`
            px-3 py-2 rounded-md text-sm font-medium
            transition-colors duration-200
            ${
              page === 1
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-card border border-border text-foreground hover:bg-muted cursor-pointer'
            }
          `}
          aria-label={tCommon('paginationPrevious')}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-muted-foreground">
                ...
              </span>
            );
          }

          const isActive = pageNum === page;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum as number)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium
                transition-colors duration-200
                cursor-pointer
                ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground hover:bg-muted'
                }
              `}
              aria-label={tCommon('paginationPage', { page: pageNum })}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next button */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={`
            px-3 py-2 rounded-md text-sm font-medium
            transition-colors duration-200
            ${
              page === totalPages
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-card border border-border text-foreground hover:bg-muted cursor-pointer'
            }
          `}
          aria-label={tCommon('paginationNext')}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  };

  /**
   * Render empty state
   */
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{t('emptyTitle')}</h3>
        <p className="text-muted-foreground max-w-sm">{t('emptyBody')}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Post grid */}
      <div
        className={`
        grid gap-6
        ${
          variant === 'compact'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }
      `}
      >
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            variant={variant}
            showCategory={showCategory}
            showThumbnail={showThumbnail}
          />
        ))}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}
