/**
 * SearchResults Component Tests
 * Validates Requirements: 9.4, 9.5
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SearchResults } from './SearchResults';
import type { Post, Book } from '@/lib/types/domain';
import type { SearchResults as SearchResultsType } from '@/lib/data/repository';

vi.mock('next/link', () => ({
  default: ({ href, children, onClick, className }: any) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

const makePost = (id: string, title: string): Post => ({
  id,
  slug: id,
  title,
  excerpt: 'excerpt',
  content: '<p>content</p>',
  categoryId: 'cat-1',
  category: {
    id: 'cat-1',
    slug: 'ladder-logic',
    name: 'Ladder Logic',
    description: '',
    fieldId: 'field-1',
    field: { id: 'field-1', slug: 'plc', name: 'PLC', description: '', postCount: 1, createdAt: new Date(), updatedAt: new Date() },
    postCount: 1,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  authorId: 'author-1',
  tags: [],
  publishedAt: new Date(),
  updatedAt: new Date(),
  viewCount: 0,
  readingTimeMinutes: 2,
  seo: { title, description: '', keywords: [] },
});

const makeBook = (id: string, title: string): Book => ({
  id,
  slug: id,
  title,
  description: 'description',
  coverImageUrl: '/img.jpg',
  authorName: 'Author',
  createdAt: new Date(),
});

describe('SearchResults', () => {
  it('should show empty state when no results', () => {
    const empty: SearchResultsType = { posts: [], books: [], totalResults: 0 };
    render(<SearchResults query="xyz" results={empty} selectedIndex={-1} />);

    expect(screen.getByText(/Không tìm thấy kết quả cho/)).toBeInTheDocument();
    expect(screen.getByText(/xyz/)).toBeInTheDocument();
  });

  it('should render Posts section header when posts exist', () => {
    const results: SearchResultsType = {
      posts: [makePost('p1', 'Post One')],
      books: [],
      totalResults: 1,
    };
    render(<SearchResults query="post" results={results} selectedIndex={-1} />);

    expect(screen.getByText('Bài viết')).toBeInTheDocument();
    expect(screen.getByText('Post One')).toBeInTheDocument();
  });

  it('should render Books section header when books exist', () => {
    const results: SearchResultsType = {
      posts: [],
      books: [makeBook('b1', 'Book One')],
      totalResults: 1,
    };
    render(<SearchResults query="book" results={results} selectedIndex={-1} />);

    expect(screen.getByText('Sách')).toBeInTheDocument();
    expect(screen.getByText('Book One')).toBeInTheDocument();
  });

  it('should render both sections when both have results', () => {
    const results: SearchResultsType = {
      posts: [makePost('p1', 'Post One')],
      books: [makeBook('b1', 'Book One')],
      totalResults: 2,
    };
    render(<SearchResults query="one" results={results} selectedIndex={-1} />);

    expect(screen.getByText('Bài viết')).toBeInTheDocument();
    expect(screen.getByText('Sách')).toBeInTheDocument();
    expect(screen.getByText('Post One')).toBeInTheDocument();
    expect(screen.getByText('Book One')).toBeInTheDocument();
  });

  it('should pass correct selectedIndex to post items', () => {
    const results: SearchResultsType = {
      posts: [makePost('p1', 'Post One'), makePost('p2', 'Post Two')],
      books: [],
      totalResults: 2,
    };
    render(<SearchResults query="post" results={results} selectedIndex={1} />);

    // Post Two (index 1) should be selected
    const links = screen.getAllByRole('link');
    expect(links[1].className).toContain('bg-primary/10');
    expect(links[0].className).not.toContain('bg-primary/10');
  });

  it('should pass correct selectedIndex to book items (offset by post count)', () => {
    const results: SearchResultsType = {
      posts: [makePost('p1', 'Post One')],
      books: [makeBook('b1', 'Book One')],
      totalResults: 2,
    };
    // selectedIndex=1 means the first book (post count = 1, so book index = 1 - 1 = 0)
    render(<SearchResults query="one" results={results} selectedIndex={1} />);

    const links = screen.getAllByRole('link');
    // links[0] = Post One, links[1] = Book One
    expect(links[1].className).toContain('bg-primary/10');
    expect(links[0].className).not.toContain('bg-primary/10');
  });
});
