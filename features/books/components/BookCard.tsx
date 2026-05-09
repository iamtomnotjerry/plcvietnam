/**
 * BookCard Component
 * Display book summary in grid or list layout
 */

'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type { Book } from '@/lib/types/domain';
import { bookHref } from '@/lib/utils/routes';

function isValidImageUrl(url: string | undefined | null): url is string {
  if (!url || url.trim() === '') return false;
  return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
}

const COVER_PLACEHOLDER = (
  <div className="w-full h-full flex items-center justify-center bg-muted">
    <svg
      className="w-12 h-12 text-muted-foreground/40"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  </div>
);

export interface BookCardProps {
  book: Book;
  variant?: 'grid' | 'list';
}

export function BookCard({ book, variant = 'grid' }: BookCardProps) {
  const t = useTranslations('books');
  const truncateDescription = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  const detailHref = bookHref(book.slug);

  const renderSeriesBadge = () => {
    if (!book.series) return null;

    return (
      <div className="flex items-center gap-1.5 text-xs text-primary">
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <span className="font-medium">{book.series}</span>
      </div>
    );
  };

  if (variant === 'grid') {
    return (
      <Link
        href={detailHref}
        className="group block h-full bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-0.5"
      >
        <div className="relative w-full h-[280px] overflow-hidden bg-muted">
          {isValidImageUrl(book.coverImageUrl) ? (
            <Image
              src={book.coverImageUrl}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            COVER_PLACEHOLDER
          )}
        </div>

        <div className="p-5">
          {book.series && <div className="mb-3">{renderSeriesBadge()}</div>}

          <h3 className="text-lg font-semibold text-card-foreground line-clamp-2 min-h-[3.5rem] mb-2 group-hover:text-primary transition-colors duration-200">
            {book.title}
          </h3>

          <p className="text-sm text-muted-foreground mb-3">
            {book.authorName}
            {book.publishedYear && (
              <span className="text-muted-foreground/70"> · {book.publishedYear}</span>
            )}
          </p>

          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {truncateDescription(book.description)}
          </p>

          <span className="inline-flex items-center text-sm font-medium text-primary">
            {t('detailCta')}
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={detailHref}
      className="group flex gap-4 bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/40 p-4"
    >
      <div className="relative w-32 h-44 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {isValidImageUrl(book.coverImageUrl) ? (
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="128px"
          />
        ) : (
          COVER_PLACEHOLDER
        )}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {book.series && <div className="mb-2">{renderSeriesBadge()}</div>}

        <h3 className="text-lg font-semibold text-card-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
          {book.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-3">
          {book.authorName}
          {book.publishedYear && (
            <span className="text-muted-foreground/70"> · {book.publishedYear}</span>
          )}
        </p>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {truncateDescription(book.description)}
        </p>

        <span className="text-sm font-medium text-primary">{t('detailCta')}</span>
      </div>
    </Link>
  );
}
