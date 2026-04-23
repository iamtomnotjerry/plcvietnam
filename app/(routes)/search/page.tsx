/**
 * Search Page Route
 * Full search results page with grouped results and pagination
 * Validates Requirements: 9.1
 */

import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchPageClient } from '@/features/search/components/SearchPageClient';

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

/**
 * Generate metadata for search page
 */
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || '';
  return {
    title: query
      ? `Kết quả tìm kiếm "${query}" - Automation Blog`
      : 'Tìm kiếm - Automation Blog',
    description: query
      ? `Kết quả tìm kiếm cho "${query}" trên Automation Blog`
      : 'Tìm kiếm bài viết và sách về tự động hóa công nghiệp',
  };
}

/**
 * Search Page Component
 *
 * Displays:
 * - Breadcrumb navigation
 * - Page heading
 * - Search form (via SearchPageClient)
 * - Grouped results: Posts and Books (via SearchPageClient)
 * - Pagination for each group
 * - Empty state when no query or no results
 */
export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors cursor-pointer">
              Trang chủ
            </Link>
          </li>
          <li>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li>
            <span className="text-foreground font-medium">Tìm kiếm</span>
          </li>
          {query && (
            <>
              <li>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li>
                <span className="text-foreground font-medium truncate max-w-[200px] inline-block align-bottom">
                  {query}
                </span>
              </li>
            </>
          )}
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
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Tìm kiếm</h1>
            <p className="text-lg text-muted-foreground mt-1">
              Tìm kiếm bài viết và sách về tự động hóa công nghiệp
            </p>
          </div>
        </div>
      </div>

      {/* Search client component — handles form, results, pagination */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-16">
          <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      }>
        <SearchPageClient initialQuery={query} />
      </Suspense>
    </div>
  );
}
