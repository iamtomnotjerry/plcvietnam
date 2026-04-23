/**
 * BookList Component
 * Display paginated list of books with optional series grouping
 * Validates Requirements: 5.1, 5.4, 5.5
 */

'use client';

import { BookCard } from './BookCard';
import type { Book } from '@/lib/types/domain';

export interface BookListProps {
  books: Book[];
  groupBySeries?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

/**
 * BookList Component
 * 
 * Displays a grid of book cards with optional pagination and series grouping
 * - Grid layout: 3 columns on desktop, 2 on tablet, 1 on mobile
 * - Series grouping: Group books by series field when enabled
 * - Pagination: 12 books per page
 * - Empty state: "Chưa có sách nào" when no books available
 */
export function BookList({ books, groupBySeries = false, pagination }: BookListProps) {
  /**
   * Group books by series
   */
  const groupBooksBySeries = (books: Book[]) => {
    const grouped = new Map<string, Book[]>();
    const noSeries: Book[] = [];

    books.forEach((book) => {
      if (book.series) {
        const existing = grouped.get(book.series) || [];
        grouped.set(book.series, [...existing, book]);
      } else {
        noSeries.push(book);
      }
    });

    return { grouped, noSeries };
  };

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
          aria-label="Trang trước"
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
              aria-label={`Trang ${pageNum}`}
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
          aria-label="Trang sau"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  };

  /**
   * Render empty state
   */
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <svg
          className="w-16 h-16 text-muted-foreground mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <h3 className="text-lg font-semibold text-foreground mb-2">Chưa có sách nào</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Hiện tại chưa có sách nào trong thư viện. Vui lòng quay lại sau.
        </p>
      </div>
    );
  }

  /**
   * Render books with series grouping
   */
  if (groupBySeries) {
    const { grouped, noSeries } = groupBooksBySeries(books);

    return (
      <div className="w-full space-y-12">
        {/* Render each series group */}
        {Array.from(grouped.entries()).map(([seriesName, seriesBooks]) => (
          <div key={seriesName}>
            {/* Series heading */}
            <div className="flex items-center gap-3 mb-6">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h2 className="text-2xl font-bold text-foreground">{seriesName}</h2>
              <span className="text-sm text-muted-foreground">({seriesBooks.length} sách)</span>
            </div>

            {/* Books grid */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {seriesBooks.map((book) => (
                <BookCard key={book.id} book={book} variant="grid" />
              ))}
            </div>
          </div>
        ))}

        {/* Render books without series */}
        {noSeries.length > 0 && (
          <div>
            {/* Heading for books without series */}
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Sách khác
              <span className="text-sm text-muted-foreground ml-3">({noSeries.length} sách)</span>
            </h2>

            {/* Books grid */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {noSeries.map((book) => (
                <BookCard key={book.id} book={book} variant="grid" />
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {renderPagination()}
      </div>
    );
  }

  /**
   * Render books without grouping
   */
  return (
    <div className="w-full">
      {/* Books grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <BookCard key={book.id} book={book} variant="grid" />
        ))}
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}
