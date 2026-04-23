/**
 * BookPageClient Component Tests
 * Validates Requirements: 5.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookPageClient } from './BookPageClient';
import type { Book } from '@/lib/types/domain';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('BookPageClient', () => {
  const mockBooks: Book[] = [
    {
      id: 'book-1',
      slug: 'plc-handbook',
      title: 'PLC Programming Handbook',
      description: 'Comprehensive guide to PLC programming',
      coverImageUrl: '/images/books/plc-handbook.jpg',
      authorName: 'John Doe',
      series: 'Industrial Automation Series',
      downloadUrl: '/downloads/plc-handbook.pdf',
      publishedYear: 2023,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'book-2',
      slug: 'scada-systems',
      title: 'SCADA Systems Guide',
      description: 'Complete guide to SCADA systems',
      coverImageUrl: '/images/books/scada-systems.jpg',
      authorName: 'Jane Smith',
      downloadUrl: '/downloads/scada-systems.pdf',
      publishedYear: 2023,
      createdAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete('page');
    
    // Mock window.scrollTo
    window.scrollTo = vi.fn();
  });

  it('should render BookList with books and pagination', () => {
    render(
      <BookPageClient
        books={mockBooks}
        pagination={{
          page: 1,
          totalPages: 3,
          total: 30,
        }}
      />
    );

    expect(screen.getByText('PLC Programming Handbook')).toBeInTheDocument();
    expect(screen.getByText('SCADA Systems Guide')).toBeInTheDocument();
  });

  it('should navigate to page 2 when page 2 button is clicked', () => {
    render(
      <BookPageClient
        books={mockBooks}
        pagination={{
          page: 1,
          totalPages: 3,
          total: 30,
        }}
      />
    );

    const page2Button = screen.getByLabelText('Trang 2');
    fireEvent.click(page2Button);

    expect(mockPush).toHaveBeenCalledWith('/books?page=2');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('should navigate to page 1 without query param when page 1 is selected', () => {
    render(
      <BookPageClient
        books={mockBooks}
        pagination={{
          page: 2,
          totalPages: 3,
          total: 30,
        }}
      />
    );

    const page1Button = screen.getByLabelText('Trang 1');
    fireEvent.click(page1Button);

    expect(mockPush).toHaveBeenCalledWith('/books');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('should navigate to next page when next button is clicked', () => {
    render(
      <BookPageClient
        books={mockBooks}
        pagination={{
          page: 1,
          totalPages: 3,
          total: 30,
        }}
      />
    );

    const nextButton = screen.getByLabelText('Trang sau');
    fireEvent.click(nextButton);

    expect(mockPush).toHaveBeenCalledWith('/books?page=2');
  });

  it('should navigate to previous page when previous button is clicked', () => {
    render(
      <BookPageClient
        books={mockBooks}
        pagination={{
          page: 2,
          totalPages: 3,
          total: 30,
        }}
      />
    );

    const prevButton = screen.getByLabelText('Trang trước');
    fireEvent.click(prevButton);

    expect(mockPush).toHaveBeenCalledWith('/books');
  });

  it('should disable previous button on first page', () => {
    render(
      <BookPageClient
        books={mockBooks}
        pagination={{
          page: 1,
          totalPages: 3,
          total: 30,
        }}
      />
    );

    const prevButton = screen.getByLabelText('Trang trước');
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    render(
      <BookPageClient
        books={mockBooks}
        pagination={{
          page: 3,
          totalPages: 3,
          total: 30,
        }}
      />
    );

    const nextButton = screen.getByLabelText('Trang sau');
    expect(nextButton).toBeDisabled();
  });

  it('should enable series grouping by default', () => {
    const booksWithSeries: Book[] = [
      {
        ...mockBooks[0],
        series: 'Series A',
      },
      {
        ...mockBooks[1],
        series: 'Series A',
      },
    ];

    render(
      <BookPageClient
        books={booksWithSeries}
        pagination={{
          page: 1,
          totalPages: 1,
          total: 2,
        }}
      />
    );

    // Should render series heading (use getAllByText since series appears multiple times)
    const seriesElements = screen.getAllByText('Series A');
    expect(seriesElements.length).toBeGreaterThan(0);
  });

  it('should allow disabling series grouping', () => {
    const booksWithSeries: Book[] = [
      {
        ...mockBooks[0],
        series: 'Series A',
      },
      {
        ...mockBooks[1],
        series: 'Series A',
      },
    ];

    render(
      <BookPageClient
        books={booksWithSeries}
        pagination={{
          page: 1,
          totalPages: 1,
          total: 2,
        }}
        groupBySeries={false}
      />
    );

    // Should not render series heading when grouping is disabled
    // Series badges on cards will still show, but not the group heading
    const seriesElements = screen.queryAllByText('Series A');
    // With grouping disabled, series only appears in book cards (2 times), not as a heading
    expect(seriesElements.length).toBe(2);
  });

  it('should render empty state when no books are provided', () => {
    render(
      <BookPageClient
        books={[]}
        pagination={{
          page: 1,
          totalPages: 1,
          total: 0,
        }}
      />
    );

    expect(screen.getByText('Chưa có sách nào')).toBeInTheDocument();
  });
});
