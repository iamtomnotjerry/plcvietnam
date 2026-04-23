/**
 * FeaturedBooksSection Component Tests
 * Validates Requirements: 11.5
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeaturedBooksSection } from './FeaturedBooksSection';
import type { Book } from '@/lib/types/domain';

describe('FeaturedBooksSection', () => {
  const mockBooks: Book[] = Array.from({ length: 5 }, (_, i) => ({
    id: `book-${i + 1}`,
    slug: `book-${i + 1}`,
    title: `Book ${i + 1}`,
    description: `Description for book ${i + 1}`,
    coverImageUrl: `/images/books/book-${i + 1}.jpg`,
    authorName: `Author ${i + 1}`,
    series: i % 2 === 0 ? 'Series A' : undefined,
    downloadUrl: `/downloads/book-${i + 1}.pdf`,
    publishedYear: 2023,
    createdAt: new Date(),
  }));

  it('renders section heading', () => {
    render(<FeaturedBooksSection books={mockBooks} />);
    
    expect(screen.getByRole('heading', { level: 2, name: 'Sách nổi bật' })).toBeInTheDocument();
  });

  it('renders "Xem tất cả sách" link', () => {
    render(<FeaturedBooksSection books={mockBooks} />);
    
    const viewAllLink = screen.getByRole('link', { name: /xem tất cả sách/i });
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink).toHaveAttribute('href', '/books');
  });

  it('displays maximum 3 books', () => {
    render(<FeaturedBooksSection books={mockBooks} />);
    
    // Should only show 3 books even though 5 were provided
    expect(screen.getByText('Book 1')).toBeInTheDocument();
    expect(screen.getByText('Book 2')).toBeInTheDocument();
    expect(screen.getByText('Book 3')).toBeInTheDocument();
    expect(screen.queryByText('Book 4')).not.toBeInTheDocument();
    expect(screen.queryByText('Book 5')).not.toBeInTheDocument();
  });

  it('displays all books when less than 3 provided', () => {
    const twoBooks = mockBooks.slice(0, 2);
    render(<FeaturedBooksSection books={twoBooks} />);
    
    expect(screen.getByText('Book 1')).toBeInTheDocument();
    expect(screen.getByText('Book 2')).toBeInTheDocument();
    expect(screen.queryByText('Book 3')).not.toBeInTheDocument();
  });

  it('renders nothing when no books provided', () => {
    const { container } = render(<FeaturedBooksSection books={[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('renders book titles', () => {
    const threeBooks = mockBooks.slice(0, 3);
    render(<FeaturedBooksSection books={threeBooks} />);
    
    expect(screen.getByText('Book 1')).toBeInTheDocument();
    expect(screen.getByText('Book 2')).toBeInTheDocument();
    expect(screen.getByText('Book 3')).toBeInTheDocument();
  });

  it('renders book descriptions', () => {
    const threeBooks = mockBooks.slice(0, 3);
    render(<FeaturedBooksSection books={threeBooks} />);
    
    expect(screen.getByText('Description for book 1')).toBeInTheDocument();
    expect(screen.getByText('Description for book 2')).toBeInTheDocument();
    expect(screen.getByText('Description for book 3')).toBeInTheDocument();
  });

  it('renders author names', () => {
    const threeBooks = mockBooks.slice(0, 3);
    render(<FeaturedBooksSection books={threeBooks} />);
    
    expect(screen.getByText('Author 1')).toBeInTheDocument();
    expect(screen.getByText('Author 2')).toBeInTheDocument();
    expect(screen.getByText('Author 3')).toBeInTheDocument();
  });
});
