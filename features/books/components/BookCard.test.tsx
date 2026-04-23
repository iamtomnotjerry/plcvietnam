/**
 * BookCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookCard } from './BookCard';
import type { Book } from '@/lib/types/domain';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    return <img src={src} alt={alt} {...props} />;
  },
}));

vi.mock('next/link', () => ({
  default: ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('BookCard', () => {
  const mockBook: Book = {
    id: 'book-1',
    slug: 'test-book',
    title: 'Test Book Title',
    description: 'This is a test book description that should be displayed in the card.',
    coverImageUrl: '/images/books/test.jpg',
    authorName: 'Test Author',
    series: 'Test Series',
    downloadUrl: '/downloads/test.pdf',
    publishedYear: 2024,
    createdAt: new Date('2024-01-01'),
  };

  describe('Grid Variant', () => {
    it('should render book information correctly', () => {
      render(<BookCard book={mockBook} variant="grid" />);

      expect(screen.getByText('Test Book Title')).toBeInTheDocument();
      expect(screen.getByText('Test Author')).toBeInTheDocument();
      expect(screen.getByText(/This is a test book description/)).toBeInTheDocument();
      expect(screen.getByAltText('Test Book Title')).toBeInTheDocument();
    });

    it('should link to the book detail page', () => {
      const { container } = render(<BookCard book={mockBook} variant="grid" />);
      const link = container.querySelector('a[href="/books/test-book"]');
      expect(link).toBeInTheDocument();
    });

    it('should display series badge when book has series', () => {
      render(<BookCard book={mockBook} variant="grid" />);
      expect(screen.getByText('Test Series')).toBeInTheDocument();
    });

    it('should not display series badge when book has no series', () => {
      const bookWithoutSeries = { ...mockBook, series: undefined };
      render(<BookCard book={bookWithoutSeries} variant="grid" />);
      expect(screen.queryByText('Test Series')).not.toBeInTheDocument();
    });

    it('should display published year when available', () => {
      render(<BookCard book={mockBook} variant="grid" />);
      expect(screen.getByText(/2024/)).toBeInTheDocument();
    });

    it('should show detail CTA text', () => {
      render(<BookCard book={mockBook} variant="grid" />);
      expect(screen.getByText(/Xem chi tiết sách/)).toBeInTheDocument();
    });

    it('should truncate description to 300 characters', () => {
      const longDescription = 'a'.repeat(350);
      const bookWithLongDesc = { ...mockBook, description: longDescription };
      render(<BookCard book={bookWithLongDesc} variant="grid" />);
      const descElement = screen.getByText(/a+\.\.\./);
      expect(descElement.textContent?.length).toBeLessThanOrEqual(303);
    });
  });

  describe('List Variant', () => {
    it('should render book information correctly in list layout', () => {
      render(<BookCard book={mockBook} variant="list" />);
      expect(screen.getByText('Test Book Title')).toBeInTheDocument();
      expect(screen.getByText('Test Author')).toBeInTheDocument();
    });

    it('should link to book detail in list layout', () => {
      const { container } = render(<BookCard book={mockBook} variant="list" />);
      const link = container.querySelector('a[href="/books/test-book"]');
      expect(link).toBeInTheDocument();
    });
  });
});
