'use client';

import type { Route } from 'next';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PostCard } from '@/features/posts/components/PostCard';
import { BookCard } from '@/features/books/components/BookCard';
import type { Post, Book } from '@/lib/types/domain';

const POSTS_PER_PAGE = 10;
const BOOKS_PER_PAGE = 6;

export interface SearchPageClientProps {
  initialQuery: string;
}

interface SearchResults {
  posts: Post[];
  books: Book[];
  totalResults: number;
}

export function SearchPageClient({ initialQuery }: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [inputValue, setInputValue] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults>({ posts: [], books: [], totalResults: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [postPage, setPostPage] = useState(1);
  const [bookPage, setBookPage] = useState(1);

  // Sync from URL
  const prevQueryRef = useRef(initialQuery);
  useEffect(() => {
    const urlQuery = searchParams.get('q') ?? '';
    if (urlQuery !== prevQueryRef.current) {
      prevQueryRef.current = urlQuery;
      setQuery(urlQuery);
      setInputValue(urlQuery);
      setPostPage(1);
      setBookPage(1);
    }
  }, [searchParams]);

  // Fetch results when query changes
  useEffect(() => {
    if (query.length < 2) {
      setResults({ posts: [], books: [], totalResults: 0 });
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setPostPage(1);
          setBookPage(1);
        }
      })
      .catch(() => {
        if (!cancelled) setResults({ posts: [], books: [], totalResults: 0 });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    router.push((trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search') as Route);
    setQuery(trimmed);
  };

  const hasQuery = query.length >= 2;
  const hasResults = results.totalResults > 0;

  const totalPostPages = Math.ceil(results.posts.length / POSTS_PER_PAGE);
  const paginatedPosts = results.posts.slice(
    (postPage - 1) * POSTS_PER_PAGE,
    postPage * POSTS_PER_PAGE
  );
  const totalBookPages = Math.ceil(results.books.length / BOOKS_PER_PAGE);
  const paginatedBooks = results.books.slice(
    (bookPage - 1) * BOOKS_PER_PAGE,
    bookPage * BOOKS_PER_PAGE
  );

  const renderPagination = (page: number, totalPages: number, onChange: (p: number) => void) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${page === 1 ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-card border border-border hover:bg-muted cursor-pointer'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${p === page ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:bg-muted'}`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${page === totalPages ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-card border border-border hover:bg-muted cursor-pointer'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tìm kiếm bài viết, sách..."
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer whitespace-nowrap"
          >
            Tìm kiếm
          </button>
        </div>
      </form>

      {/* Empty query */}
      {!hasQuery && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Tìm kiếm nội dung</h2>
          <p className="text-muted-foreground max-w-md">
            Nhập từ khóa để tìm kiếm bài viết và sách về tự động hóa công nghiệp.
          </p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
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
          <span className="ml-3 text-muted-foreground">Đang tìm kiếm...</span>
        </div>
      )}

      {/* No results */}
      {hasQuery && !isLoading && !hasResults && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-lg text-muted-foreground">
            Không tìm thấy kết quả cho &ldquo;{query}&rdquo;
          </p>
        </div>
      )}

      {/* Results */}
      {hasQuery && !isLoading && hasResults && (
        <div className="space-y-12">
          <p className="text-sm text-muted-foreground">
            Tìm thấy <span className="font-semibold text-foreground">{results.totalResults}</span>{' '}
            kết quả cho &ldquo;{query}&rdquo;
          </p>

          {results.posts.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold text-foreground">Bài viết</h2>
                <span className="text-sm text-muted-foreground">({results.posts.length})</span>
              </div>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {paginatedPosts.map((post) => (
                  <PostCard key={post.id} post={post} showCategory showThumbnail />
                ))}
              </div>
              {renderPagination(postPage, totalPostPages, (p) => {
                setPostPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              })}
            </section>
          )}

          {results.books.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold text-foreground">Sách</h2>
                <span className="text-sm text-muted-foreground">({results.books.length})</span>
              </div>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {paginatedBooks.map((book) => (
                  <BookCard key={book.id} book={book} variant="grid" />
                ))}
              </div>
              {renderPagination(bookPage, totalBookPages, setBookPage)}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
