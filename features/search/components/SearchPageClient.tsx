/**
 * SearchPageClient Component
 * Client-side search page with grouped results and pagination
 * Validates Requirements: 9.1, 9.4, 9.5
 */

'use client';

import type { Route } from 'next';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PostCard } from '@/features/posts/components/PostCard';
import { BookCard } from '@/features/books/components/BookCard';
import { searchContent } from '@/features/search/utils/searchEngine';
import { contentRepository } from '@/lib/data/factory';
import type { Post, Book } from '@/lib/types/domain';

const POSTS_PER_PAGE = 10;
const BOOKS_PER_PAGE = 6;

export interface SearchPageClientProps {
  initialQuery: string;
}

export function SearchPageClient({ initialQuery }: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [postPage, setPostPage] = useState(1);
  const [bookPage, setBookPage] = useState(1);

  // Load all data once
  useEffect(() => {
    async function loadData() {
      try {
        const [postsResult, booksResult] = await Promise.all([
          contentRepository.getPosts({ limit: 1000 }),
          contentRepository.getBooks({ limit: 1000 }),
        ]);
        setAllPosts(postsResult.data);
        setAllBooks(booksResult.data);
      } catch {
        // silently fail
      } finally {
        setDataLoaded(true);
      }
    }
    loadData();
  }, []);

  // Sync query from URL param changes
  const prevQueryRef = useRef(initialQuery);
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== prevQueryRef.current) {
      prevQueryRef.current = urlQuery;
      setQuery(urlQuery);
      setInputValue(urlQuery);
      setPostPage(1);
      setBookPage(1);
    }
  }, [searchParams]);

  // Run search
  const searchResults =
    dataLoaded && query.length >= 2
      ? searchContent(query, allPosts, allBooks)
      : { posts: [], books: [], totalResults: 0 };

  const hasQuery = query.length >= 2;
  const hasResults = searchResults.totalResults > 0;

  // Paginate posts
  const totalPostPages = Math.ceil(searchResults.posts.length / POSTS_PER_PAGE);
  const paginatedPosts = searchResults.posts.slice(
    (postPage - 1) * POSTS_PER_PAGE,
    postPage * POSTS_PER_PAGE
  );

  // Paginate books
  const totalBookPages = Math.ceil(searchResults.books.length / BOOKS_PER_PAGE);
  const paginatedBooks = searchResults.books.slice(
    (bookPage - 1) * BOOKS_PER_PAGE,
    bookPage * BOOKS_PER_PAGE
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set('q', trimmed);
    router.push(`/search${trimmed ? `?${params.toString()}` : ''}` as Route);
  };

  const renderPagination = (
    page: number,
    totalPages: number,
    onPageChange: (p: number) => void
  ) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            page === 1
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-card border border-border text-foreground hover:bg-muted cursor-pointer'
          }`}
          aria-label="Trang trước"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${
              p === page
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-foreground hover:bg-muted'
            }`}
            aria-label={`Trang ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            page === totalPages
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-card border border-border text-foreground hover:bg-muted cursor-pointer'
          }`}
          aria-label="Trang sau"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tìm kiếm bài viết, sách..."
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200"
              aria-label="Từ khóa tìm kiếm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors duration-200 cursor-pointer whitespace-nowrap"
          >
            Tìm kiếm
          </button>
        </div>
      </form>

      {/* No query state */}
      {!hasQuery && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <svg
            className="w-16 h-16 text-muted-foreground mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-foreground mb-2">Tìm kiếm nội dung</h2>
          <p className="text-muted-foreground max-w-md">
            Nhập từ khóa để tìm kiếm bài viết và sách về tự động hóa công nghiệp.
          </p>
        </div>
      )}

      {/* Loading state */}
      {hasQuery && !dataLoaded && (
        <div className="flex items-center justify-center py-16">
          <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="ml-3 text-muted-foreground">Đang tìm kiếm...</span>
        </div>
      )}

      {/* No results */}
      {hasQuery && dataLoaded && !hasResults && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <svg
            className="w-16 h-16 text-muted-foreground mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg text-muted-foreground">
            Không tìm thấy kết quả cho &ldquo;{query}&rdquo;
          </p>
        </div>
      )}

      {/* Results */}
      {hasQuery && hasResults && (
        <div className="space-y-12">
          {/* Summary */}
          <p className="text-sm text-muted-foreground">
            Tìm thấy{' '}
            <span className="font-semibold text-foreground">{searchResults.totalResults}</span>{' '}
            kết quả cho &ldquo;{query}&rdquo;
          </p>

          {/* Posts section */}
          {searchResults.posts.length > 0 && (
            <section aria-labelledby="search-posts-heading">
              <div className="flex items-center gap-3 mb-6">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 id="search-posts-heading" className="text-xl font-bold text-foreground">
                  Bài viết
                </h2>
                <span className="text-sm text-muted-foreground">({searchResults.posts.length} kết quả)</span>
              </div>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {paginatedPosts.map((post) => (
                  <PostCard key={post.id} post={post} variant="default" showCategory={true} showThumbnail={true} />
                ))}
              </div>
              {renderPagination(postPage, totalPostPages, (p) => {
                setPostPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              })}
            </section>
          )}

          {/* Books section */}
          {searchResults.books.length > 0 && (
            <section aria-labelledby="search-books-heading">
              <div className="flex items-center gap-3 mb-6">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h2 id="search-books-heading" className="text-xl font-bold text-foreground">
                  Sách
                </h2>
                <span className="text-sm text-muted-foreground">({searchResults.books.length} kết quả)</span>
              </div>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {paginatedBooks.map((book) => (
                  <BookCard key={book.id} book={book} variant="grid" />
                ))}
              </div>
              {renderPagination(bookPage, totalBookPages, (p) => {
                setBookPage(p);
              })}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
