/**
 * FeaturedBooksSection Component
 * Display 3 featured books in horizontal layout
 * Validates Requirements: 11.5
 */

'use client';

import Link from 'next/link';
import { BookCard } from '@/features/books/components';
import type { Book } from '@/lib/types/domain';

export interface FeaturedBooksSectionProps {
  books: Book[];  // 3 featured
}

/**
 * FeaturedBooksSection Component
 * 
 * Displays:
 * - Section heading: "Sách nổi bật"
 * - Horizontal carousel of 3 BookCard components
 * - "Xem tất cả sách" link to books page
 */
export function FeaturedBooksSection({ books }: FeaturedBooksSectionProps) {
  // Limit to 3 books
  const displayBooks = books.slice(0, 3);
  
  if (displayBooks.length === 0) {
    return null;
  }
  
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Sách nổi bật
          </h2>
          
          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-200 font-medium cursor-pointer"
          >
            <span>Xem tất cả sách</span>
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
          </Link>
        </div>
        
        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              variant="grid"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
