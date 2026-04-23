/**
 * SearchResultItem Component Tests
 * Validates Requirements: 9.4, 9.5
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchResultItem } from './SearchResultItem';
import type { Post, Book } from '@/lib/types/domain';

vi.mock('next/link', () => ({
  default: ({ href, children, onClick, className }: any) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

const mockPost: Post = {
  id: 'post-1',
  slug: 'intro-to-plc',
  title: 'Introduction to PLC',
  excerpt: 'Learn PLC basics',
  content: '<p>Content</p>',
  categoryId: 'cat-1',
  category: {
    id: 'cat-1',
    slug: 'ladder-logic',
    name: 'Ladder Logic',
    description: '',
    fieldId: 'field-1',
    field: {
      id: 'field-1',
      slug: 'plc',
      name: 'PLC Programming',
      description: '',
      postCount: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    postCount: 5,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  authorId: 'author-1',
  tags: [],
  publishedAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  viewCount: 0,
  readingTimeMinutes: 3,
  seo: { title: 'Intro', description: 'Intro', keywords: [] },
};

const mockBook: Book = {
  id: 'book-1',
  slug: 'plc-handbook',
  title: 'PLC Handbook',
  description: 'Comprehensive PLC guide',
  coverImageUrl: '/images/book.jpg',
  authorName: 'John Doe',
  externalUrl: 'https://example.com/book',
  createdAt: new Date('2024-01-01'),
};

describe('SearchResultItem', () => {
  describe('Post result', () => {
    it('should render post title', () => {
      render(
        <SearchResultItem type="post" item={mockPost} isSelected={false} />
      );
      expect(screen.getByText('Introduction to PLC')).toBeInTheDocument();
    });

    it('should render category breadcrumb', () => {
      render(
        <SearchResultItem type="post" item={mockPost} isSelected={false} />
      );
      expect(screen.getByText(/PLC Programming/)).toBeInTheDocument();
      expect(screen.getByText(/Ladder Logic/)).toBeInTheDocument();
    });

    it('should link to correct post URL', () => {
      render(
        <SearchResultItem type="post" item={mockPost} isSelected={false} />
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/fields/plc/ladder-logic/intro-to-plc');
    });

    it('should apply selected styles when isSelected is true', () => {
      render(
        <SearchResultItem type="post" item={mockPost} isSelected={true} />
      );
      const link = screen.getByRole('link');
      expect(link.className).toContain('bg-primary/10');
    });

    it('should call onClick when clicked', async () => {
      const onClick = vi.fn();
      render(
        <SearchResultItem type="post" item={mockPost} isSelected={false} onClick={onClick} />
      );
      await userEvent.click(screen.getByRole('link'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Book result', () => {
    it('should render book title', () => {
      render(
        <SearchResultItem type="book" item={mockBook} isSelected={false} />
      );
      expect(screen.getByText('PLC Handbook')).toBeInTheDocument();
    });

    it('should render author name', () => {
      render(
        <SearchResultItem type="book" item={mockBook} isSelected={false} />
      );
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should link to the internal book detail page', () => {
      render(
        <SearchResultItem type="book" item={mockBook} isSelected={false} />
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/books/plc-handbook');
    });

    it('should apply selected styles when isSelected is true', () => {
      render(
        <SearchResultItem type="book" item={mockBook} isSelected={true} />
      );
      const link = screen.getByRole('link');
      expect(link.className).toContain('bg-primary/10');
    });
  });
});
