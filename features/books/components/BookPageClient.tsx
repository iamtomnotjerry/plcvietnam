/**
 * BookPageClient Component
 * Client-side wrapper for book list with pagination navigation
 * Validates Requirements: 5.5
 */

'use client';

import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookList } from './BookList';
import type { Book } from '@/lib/types/domain';

export interface BookPageClientProps {
  books: Book[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  groupBySeries?: boolean;
}

/**
 * Client component that wraps BookList with pagination navigation
 * Handles page changes by updating URL search params
 */
export function BookPageClient({
  books,
  pagination,
  groupBySeries = true,
}: BookPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Handle page change by updating URL
   */
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newPage === 1) {
      // Remove page param for page 1 (cleaner URLs)
      params.delete('page');
    } else {
      params.set('page', newPage.toString());
    }
    
    const queryString = params.toString();
    const url = queryString ? `/books?${queryString}` : '/books';
    
    router.push(url as Route);
    
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <BookList
      books={books}
      groupBySeries={groupBySeries}
      pagination={{
        page: pagination.page,
        totalPages: pagination.totalPages,
        onPageChange: handlePageChange,
      }}
    />
  );
}
