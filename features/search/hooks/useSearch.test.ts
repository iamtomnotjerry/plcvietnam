import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSearch } from './useSearch';
import type { Post, Book } from '@/lib/types/domain';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

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
    field: {
      id: 'field-1',
      slug: 'plc',
      name: 'PLC',
      description: '',
      postCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
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
  seo: { title: 'Test', description: 'Desc', keywords: [] },
};
const mockBook: Book = {
  id: 'book-1',
  slug: 'book-1',
  title: 'Test Book',
  description: 'Desc',
  coverImageUrl: '/img/book.jpg',
  authorName: 'Author',
  createdAt: new Date('2024-01-01'),
};

function jsonRes(data: unknown) {
  return Promise.resolve(
    new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

describe('useSearch', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should debounce search and only call fetch after delay', async () => {
    mockFetch.mockReturnValue(jsonRes({ posts: [mockPost], books: [], totalResults: 1 }));
    const { result } = renderHook(() => useSearch(100));
    act(() => result.current.setQuery('PLC'));
    expect(mockFetch).not.toHaveBeenCalled();
    await waitFor(() => expect(mockFetch).toHaveBeenCalled(), { timeout: 500 });
  });

  it('should open results when query has 2+ characters and results exist', async () => {
    mockFetch.mockReturnValue(jsonRes({ posts: [mockPost], books: [], totalResults: 1 }));
    const { result } = renderHook(() => useSearch(50));
    act(() => result.current.setQuery('PL'));
    await waitFor(() => expect(result.current.isOpen).toBe(true));
    expect(result.current.results.posts).toHaveLength(1);
  });

  it('should show empty state when no results found', async () => {
    mockFetch.mockReturnValue(jsonRes({ posts: [], books: [], totalResults: 0 }));
    const { result } = renderHook(() => useSearch(50));
    act(() => result.current.setQuery('xyz'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.results.totalResults).toBe(0);
  });

  it('should close and reset when query is cleared', async () => {
    mockFetch.mockReturnValue(jsonRes({ posts: [mockPost], books: [], totalResults: 1 }));
    const { result } = renderHook(() => useSearch(50));
    act(() => result.current.setQuery('PLC'));
    await waitFor(() => expect(result.current.isOpen).toBe(true));
    act(() => result.current.setQuery(''));
    await waitFor(() => expect(result.current.isOpen).toBe(false));
    expect(result.current.results.totalResults).toBe(0);
  });

  it('should build flatResults with posts first then books', async () => {
    mockFetch.mockReturnValue(jsonRes({ posts: [mockPost], books: [mockBook], totalResults: 2 }));
    const { result } = renderHook(() => useSearch(50));
    act(() => result.current.setQuery('test'));
    await waitFor(() => expect(result.current.flatResults.length).toBe(2));
    expect(result.current.flatResults[0].type).toBe('post');
    expect(result.current.flatResults[1].type).toBe('book');
  });

  it('should reset selectedIndex when new search runs', async () => {
    mockFetch.mockReturnValue(jsonRes({ posts: [mockPost], books: [], totalResults: 1 }));
    const { result } = renderHook(() => useSearch(50));
    // Set a selected index first
    act(() => result.current.setSelectedIndex(2));
    expect(result.current.selectedIndex).toBe(2);
    // Trigger a new search - selectedIndex resets after results come back
    act(() => result.current.setQuery('PLC'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.selectedIndex).toBe(-1);
  });
});
