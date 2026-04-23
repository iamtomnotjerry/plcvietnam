/**
 * useSearch Hook Tests
 * Validates Requirements: 9.1, 9.2, 9.4, 9.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSearch } from './useSearch';
import type { Post, Book } from '@/lib/types/domain';
import type { PaginatedResult } from '@/lib/data/repository';

// Mock the content repository
vi.mock('@/lib/data/factory', () => ({
  contentRepository: {
    getPosts: vi.fn(),
    getBooks: vi.fn(),
  },
}));

// Mock the search engine
vi.mock('@/features/search/utils/searchEngine', () => ({
  searchContent: vi.fn(),
}));

import { contentRepository } from '@/lib/data/factory';
import { searchContent } from '@/features/search/utils/searchEngine';

const mockPost: Post = {
  id: 'post-1',
  slug: 'test-post',
  title: 'Test Post',
  excerpt: 'Test excerpt',
  content: '<p>Content</p>',
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
  publishedAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  viewCount: 0,
  readingTimeMinutes: 3,
  seo: { title: 'Test', description: 'Test', keywords: [] },
};

const mockBook: Book = {
  id: 'book-1',
  slug: 'test-book',
  title: 'Test Book',
  description: 'Test book description',
  coverImageUrl: '/images/book.jpg',
  authorName: 'Author',
  createdAt: new Date('2024-01-01'),
};

const emptyResults = { posts: [], books: [], totalResults: 0 };
const mockResults = { posts: [mockPost], books: [mockBook], totalResults: 2 };

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    const postsPaginated: PaginatedResult<Post> = {
      data: [mockPost],
      pagination: { page: 1, limit: 1000, total: 1, totalPages: 1 },
    };
    const booksPaginated: PaginatedResult<Book> = {
      data: [mockBook],
      pagination: { page: 1, limit: 1000, total: 1, totalPages: 1 },
    };

    vi.mocked(contentRepository.getPosts).mockResolvedValue(postsPaginated);
    vi.mocked(contentRepository.getBooks).mockResolvedValue(booksPaginated);
    vi.mocked(searchContent).mockReturnValue(emptyResults);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start with empty state', () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.query).toBe('');
    expect(result.current.results).toEqual(emptyResults);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedIndex).toBe(-1);
  });

  it('should not search for queries shorter than 2 characters', async () => {
    const { result } = renderHook(() => useSearch(300));

    act(() => {
      result.current.setQuery('a');
    });

    // Advance debounce timer
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isOpen).toBe(false);
    expect(searchContent).not.toHaveBeenCalled();
  });

  it('should debounce search and only call searchContent after delay', async () => {
    vi.mocked(searchContent).mockReturnValue(mockResults);

    const { result } = renderHook(() => useSearch(300));

    act(() => {
      result.current.setQuery('pl');
    });

    // Before debounce fires
    expect(searchContent).not.toHaveBeenCalled();

    // Advance timer
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(searchContent).toHaveBeenCalledWith('pl', expect.any(Array), expect.any(Array));
  });

  it('should open results when query has 2+ characters and results exist', async () => {
    vi.mocked(searchContent).mockReturnValue(mockResults);

    const { result } = renderHook(() => useSearch(300));

    act(() => {
      result.current.setQuery('plc');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.results).toEqual(mockResults);
  });

  it('should show empty state when no results found', async () => {
    vi.mocked(searchContent).mockReturnValue(emptyResults);

    const { result } = renderHook(() => useSearch(300));

    act(() => {
      result.current.setQuery('xyz');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // isOpen is true when query >= 2 chars (to show empty state message)
    expect(result.current.isOpen).toBe(true);
    expect(result.current.results.totalResults).toBe(0);
  });

  it('should close and reset when query is cleared', async () => {
    vi.mocked(searchContent).mockReturnValue(mockResults);

    const { result } = renderHook(() => useSearch(300));

    act(() => {
      result.current.setQuery('plc');
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.setQuery('');
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.results).toEqual(emptyResults);
  });

  it('should close via close() function', async () => {
    vi.mocked(searchContent).mockReturnValue(mockResults);

    const { result } = renderHook(() => useSearch(300));

    act(() => {
      result.current.setQuery('plc');
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.selectedIndex).toBe(-1);
  });

  it('should build flatResults with posts first then books', async () => {
    vi.mocked(searchContent).mockReturnValue(mockResults);

    const { result } = renderHook(() => useSearch(300));

    act(() => {
      result.current.setQuery('test');
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.flatResults).toHaveLength(2);
    expect(result.current.flatResults[0].type).toBe('post');
    expect(result.current.flatResults[1].type).toBe('book');
  });

  it('should update selectedIndex', () => {
    const { result } = renderHook(() => useSearch(300));

    act(() => {
      result.current.setSelectedIndex(2);
    });

    expect(result.current.selectedIndex).toBe(2);
  });

  it('should reset selectedIndex when new search runs', async () => {
    vi.mocked(searchContent).mockReturnValue(mockResults);

    const { result } = renderHook(() => useSearch(300));

    act(() => {
      result.current.setSelectedIndex(1);
    });

    act(() => {
      result.current.setQuery('plc');
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.selectedIndex).toBe(-1);
  });
});
