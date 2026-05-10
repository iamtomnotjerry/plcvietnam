/**
 * FeaturedBooksSection Component
 * Display 3 featured books in horizontal layout
 * Validates Requirements: 11.5
 */

'use client';

import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { BookCard } from '@/features/books/components';
import type { Book } from '@/lib/types/domain';
import { HomeSectionHeader } from './HomeSectionHeader';

export interface FeaturedBooksSectionProps {
  books: Book[];
}

export function FeaturedBooksSection({ books }: FeaturedBooksSectionProps) {
  const t = useTranslations('home');
  const displayBooks = books.slice(0, 3);

  if (displayBooks.length === 0) {
    return null;
  }

  const seeAll = (
    <Link
      href="/books"
      className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-card/75 px-4 py-2.5 text-sm font-semibold text-primary shadow-sm backdrop-blur-sm transition-all hover:border-primary/35 hover:bg-primary/10"
    >
      {t('seeAllBooks')}
      <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
    </Link>
  );

  return (
    <section className="section-surface-glass-accent py-16 md:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_80%_100%,color-mix(in_oklab,var(--color-accent)_12%,transparent),transparent)] opacity-90 motion-reduce:opacity-100"
        aria-hidden
      />
      <div className="editorial-container relative">
        <HomeSectionHeader eyebrow={t('booksEyebrow')} title={t('featuredBooks')} action={seeAll} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayBooks.map((book) => (
            <BookCard key={book.id} book={book} variant="grid" />
          ))}
        </div>
      </div>
    </section>
  );
}
