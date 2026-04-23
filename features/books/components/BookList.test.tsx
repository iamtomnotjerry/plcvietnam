/**
 * BookList Component Tests
 * Validates Requirements: 5.1, 5.4, 5.5
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookList } from './BookList';
import type { Book } from '@/lib/types/domain';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe('BookList', () => {
  const mockBooks: Book[] = [
    {
      id: 'book-1',
      slug: 'book-1',
      title: 'Book 1',
      description: 'Description 1',
      coverImageUrl: '/images/book1.jpg',
      authorName: 'Author 1',
      series: 'Series A',
      downloadUrl: '/downloads/book1.pdf',
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'book-2',
      slug: 'book-2',
      title: 'Book 2',
      description: 'Description 2',
      coverImageUrl: '/images/book2.jpg',
      authorName: 'Author 2',
      series: 'Series A',
      downloadUrl: '/downloads/book2.pdf',
      createdAt: new Date('2024-01-02'),
    },
    {
      id: 'book-3',
      slug: 'book-3',
      title: 'Book 3',
      description: 'Description 3',
      coverImageUrl: '/images/book3.jpg',
      authorName: 'Author 3',
      series: 'Series B',
      downloadUrl: '/downloads/book3.pdf',
      createdAt: new Date('2024-01-03'),
    },
    {
      id: 'book-4',
      slug: 'book-4',
      title: 'Book 4',
      description: 'Description 4',
      coverImageUrl: '/images/book4.jpg',
      authorName: 'Author 4',
      downloadUrl: '/downloads/book4.pdf',
      createdAt: new Date('2024-01-04'),
    },
  ];

  describe('Empty State', () => {
    it('should display empty state when no books', () => {
      render(<BookList books={[]} />);

      expect(screen.getByText('Chưa có sách nào')).toBeInTheDocument();
      expect(
        screen.getByText(/Hiện tại chưa có sách nào trong thư viện/)
      ).toBeInTheDocument();
    });
  });

  describe('Basic Rendering', () => {
    it('should render all books in grid layout', () => {
      render(<BookList books={mockBooks} />);

      expect(screen.getByText('Book 1')).toBeInTheDocument();
      expect(screen.getByText('Book 2')).toBeInTheDocument();
      expect(screen.getByText('Book 3')).toBeInTheDocument();
      expect(screen.getByText('Book 4')).toBeInTheDocument();
    });

    it('should render books without series grouping by default', () => {
      render(<BookList books={mockBooks} />);

      // Should not show series headings (h2 elements)
      // Note: Series badges still appear on individual cards
      const seriesHeadings = screen.queryAllByRole('heading', { level: 2, name: /Series/ });
      expect(seriesHeadings.length).toBe(0);
    });
  });

  describe('Series Grouping', () => {
    it('should group books by series when enabled', () => {
      render(<BookList books={mockBooks} groupBySeries={true} />);

      // Should show series headings (h2 elements)
      expect(screen.getByRole('heading', { level: 2, name: /Series A/ })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /Series B/ })).toBeInTheDocument();
    });

    it('should display book count for each series', () => {
      render(<BookList books={mockBooks} groupBySeries={true} />);

      // Series A has 2 books
      const seriesAHeading = screen.getByRole('heading', { level: 2, name: /Series A/ });
      expect(seriesAHeading.parentElement).toHaveTextContent('(2 sách)');
      
      // Series B has 1 book
      const seriesBHeading = screen.getByRole('heading', { level: 2, name: /Series B/ });
      expect(seriesBHeading.parentElement).toHaveTextContent('(1 sách)');
    });

    it('should display books without series in separate section', () => {
      const booksWithMixed = [
        ...mockBooks,
        {
          id: 'book-5',
          slug: 'book-5',
          title: 'Book Without Series',
          description: 'Description 5',
          coverImageUrl: '/images/book5.jpg',
          authorName: 'Author 5',
          downloadUrl: '/downloads/book5.pdf',
          createdAt: new Date('2024-01-05'),
        },
      ];

      render(<BookList books={booksWithMixed} groupBySeries={true} />);

      expect(screen.getByText('Sách khác')).toBeInTheDocument();
      expect(screen.getByText('Book Without Series')).toBeInTheDocument();
    });

    it('should not display "Sách khác" section when all books have series', () => {
      // Use only books with series
      const booksWithSeries = mockBooks.filter(book => book.series);
      render(<BookList books={booksWithSeries} groupBySeries={true} />);

      expect(screen.queryByText('Sách khác')).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    const mockPagination = {
      page: 1,
      totalPages: 3,
      onPageChange: vi.fn(),
    };

    it('should not display pagination when totalPages is 1', () => {
      render(
        <BookList
          books={mockBooks}
          pagination={{ ...mockPagination, totalPages: 1 }}
        />
      );

      expect(screen.queryByLabelText('Trang trước')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Trang sau')).not.toBeInTheDocument();
    });

    it('should display pagination controls when totalPages > 1', () => {
      render(<BookList books={mockBooks} pagination={mockPagination} />);

      expect(screen.getByLabelText('Trang trước')).toBeInTheDocument();
      expect(screen.getByLabelText('Trang sau')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should disable previous button on first page', () => {
      render(<BookList books={mockBooks} pagination={mockPagination} />);

      const prevButton = screen.getByLabelText('Trang trước');
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      render(
        <BookList
          books={mockBooks}
          pagination={{ ...mockPagination, page: 3 }}
        />
      );

      const nextButton = screen.getByLabelText('Trang sau');
      expect(nextButton).toBeDisabled();
    });

    it('should call onPageChange when clicking page number', () => {
      const onPageChange = vi.fn();
      render(
        <BookList
          books={mockBooks}
          pagination={{ ...mockPagination, onPageChange }}
        />
      );

      const page2Button = screen.getByText('2');
      fireEvent.click(page2Button);

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when clicking next button', () => {
      const onPageChange = vi.fn();
      render(
        <BookList
          books={mockBooks}
          pagination={{ ...mockPagination, onPageChange }}
        />
      );

      const nextButton = screen.getByLabelText('Trang sau');
      fireEvent.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when clicking previous button', () => {
      const onPageChange = vi.fn();
      render(
        <BookList
          books={mockBooks}
          pagination={{ ...mockPagination, page: 2, onPageChange }}
        />
      );

      const prevButton = screen.getByLabelText('Trang trước');
      fireEvent.click(prevButton);

      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('should highlight current page', () => {
      render(
        <BookList
          books={mockBooks}
          pagination={{ ...mockPagination, page: 2 }}
        />
      );

      const page2Button = screen.getByText('2');
      expect(page2Button).toHaveAttribute('aria-current', 'page');
    });

    it('should display ellipsis for large page counts', () => {
      render(
        <BookList
          books={mockBooks}
          pagination={{ ...mockPagination, page: 5, totalPages: 10 }}
        />
      );

      const ellipses = screen.getAllByText('...');
      expect(ellipses.length).toBeGreaterThan(0);
    });
  });

  describe('Grid Layout', () => {
    it('should render books in grid layout', () => {
      const { container } = render(<BookList books={mockBooks} />);

      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });
  });
});
