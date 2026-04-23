/**
 * Books Page Route
 * Display paginated list of books
 * Validates Requirements: 5.1, 5.5
 */

import { Suspense } from 'react';
import { contentRepository } from '@/lib/data/factory';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BookPageClient } from '@/features/books/components/BookPageClient';

interface BooksPageProps {
  searchParams: Promise<{ page?: string }>;
}

/**
 * Generate metadata for books page
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Sách - Automation Blog',
    description: 'Khám phá các sách và tài liệu kỹ thuật về tự động hóa công nghiệp',
  };
}

/**
 * Books Page Component
 * 
 * Displays:
 * - Page heading and description
 * - Paginated list of books (12 per page)
 * - Breadcrumb navigation
 * - Series grouping when enabled
 */
export default async function BooksPage({
  searchParams,
}: BooksPageProps) {
  const sp = await searchParams;
  const pageParam = parseInt(sp.page || '1', 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const limit = 12; // Requirement 5.5: 12 books per page
  
  // Fetch books with pagination
  const booksResult = await contentRepository.getBooks({ page, limit });
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/"
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Trang chủ
            </Link>
          </li>
          <li>
            <svg
              className="w-4 h-4"
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
          </li>
          <li>
            <span className="text-foreground font-medium">Sách</span>
          </li>
        </ol>
      </nav>
      
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <svg
              className="w-8 h-8 text-primary"
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
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Sách & Tài liệu
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Khám phá các sách và tài liệu kỹ thuật về tự động hóa công nghiệp
            </p>
          </div>
        </div>
      </div>
      
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
        <BookPageClient
          books={booksResult.data}
          pagination={{
            page: booksResult.pagination.page,
            totalPages: booksResult.pagination.totalPages,
            total: booksResult.pagination.total,
          }}
          groupBySeries={true}
        />
      </Suspense>
    </div>
  );
}
