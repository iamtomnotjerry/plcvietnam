/**
 * SearchInput Component Tests
 * Validates Requirements: 9.1, 9.2, 9.4, 9.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from './SearchInput';

// Mock useSearch hook
vi.mock('@/features/search/hooks/useSearch', () => ({
  useSearch: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, onClick, className }: any) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

import { useSearch } from '@/features/search/hooks/useSearch';
import type { Post, Book } from '@/lib/types/domain';

const mockPost: Post = {
  id: 'post-1',
  slug: 'test-post',
  title: 'Test Post',
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
  seo: { title: 'Test', description: '', keywords: [] },
};

const defaultSearchState = {
  query: '',
  setQuery: vi.fn(),
  results: { posts: [], books: [], totalResults: 0 },
  isLoading: false,
  isOpen: false,
  close: vi.fn(),
  selectedIndex: -1,
  setSelectedIndex: vi.fn(),
  flatResults: [],
};

describe('SearchInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSearch).mockReturnValue({ ...defaultSearchState });
  });

  describe('Rendering', () => {
    it('should render search input with placeholder', () => {
      render(<SearchInput />);
      expect(screen.getByPlaceholderText('Tìm kiếm...')).toBeInTheDocument();
    });

    it('should render overlay variant with different placeholder', () => {
      render(<SearchInput variant="overlay" />);
      expect(screen.getByPlaceholderText('Tìm kiếm bài viết, sách...')).toBeInTheDocument();
    });

    it('should not show results dropdown when isOpen is false', () => {
      render(<SearchInput />);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should show results dropdown when isOpen is true', () => {
      vi.mocked(useSearch).mockReturnValue({
        ...defaultSearchState,
        query: 'plc',
        isOpen: true,
        results: { posts: [mockPost], books: [], totalResults: 1 },
        flatResults: [{ type: 'post', item: mockPost }],
      });

      render(<SearchInput />);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should show loading spinner when isLoading is true', () => {
      vi.mocked(useSearch).mockReturnValue({
        ...defaultSearchState,
        isLoading: true,
      });

      render(<SearchInput />);
      // Loading spinner is an SVG with animate-spin class
      const spinners = document.querySelectorAll('.animate-spin');
      expect(spinners.length).toBeGreaterThan(0);
    });
  });

  describe('Input interaction', () => {
    it('should call setQuery when user types', async () => {
      const setQuery = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        ...defaultSearchState,
        setQuery,
      });

      render(<SearchInput />);
      const input = screen.getByRole('combobox');
      await userEvent.type(input, 'plc');

      expect(setQuery).toHaveBeenCalled();
    });

    it('should pass debounceMs to useSearch', () => {
      render(<SearchInput debounceMs={500} />);
      expect(useSearch).toHaveBeenCalledWith(500);
    });

    it('should use default debounceMs of 300', () => {
      render(<SearchInput />);
      expect(useSearch).toHaveBeenCalledWith(300);
    });
  });

  describe('Keyboard navigation', () => {
    beforeEach(() => {
      vi.mocked(useSearch).mockReturnValue({
        ...defaultSearchState,
        query: 'plc',
        isOpen: true,
        results: { posts: [mockPost], books: [], totalResults: 1 },
        flatResults: [{ type: 'post', item: mockPost }],
        selectedIndex: -1,
      });
    });

    it('should call setSelectedIndex with incremented value on ArrowDown', () => {
      const setSelectedIndex = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        ...defaultSearchState,
        query: 'plc',
        isOpen: true,
        results: { posts: [mockPost], books: [], totalResults: 1 },
        flatResults: [{ type: 'post', item: mockPost }],
        selectedIndex: -1,
        setSelectedIndex,
      });

      render(<SearchInput />);
      const input = screen.getByRole('combobox');
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      expect(setSelectedIndex).toHaveBeenCalledWith(0);
    });

    it('should call setSelectedIndex with decremented value on ArrowUp', () => {
      const setSelectedIndex = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        ...defaultSearchState,
        query: 'plc',
        isOpen: true,
        results: { posts: [mockPost], books: [], totalResults: 1 },
        flatResults: [{ type: 'post', item: mockPost }],
        selectedIndex: 1,
        setSelectedIndex,
      });

      render(<SearchInput />);
      const input = screen.getByRole('combobox');
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(setSelectedIndex).toHaveBeenCalledWith(0);
    });

    it('should call close on Escape key', () => {
      const close = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        ...defaultSearchState,
        query: 'plc',
        isOpen: true,
        results: { posts: [mockPost], books: [], totalResults: 1 },
        flatResults: [{ type: 'post', item: mockPost }],
        close,
      });

      render(<SearchInput />);
      const input = screen.getByRole('combobox');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(close).toHaveBeenCalled();
    });

    it('should not go below -1 on ArrowUp when at start', () => {
      const setSelectedIndex = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        ...defaultSearchState,
        query: 'plc',
        isOpen: true,
        results: { posts: [mockPost], books: [], totalResults: 1 },
        flatResults: [{ type: 'post', item: mockPost }],
        selectedIndex: -1,
        setSelectedIndex,
      });

      render(<SearchInput />);
      const input = screen.getByRole('combobox');
      fireEvent.keyDown(input, { key: 'ArrowUp' });

      expect(setSelectedIndex).toHaveBeenCalledWith(-1);
    });

    it('should not exceed last index on ArrowDown', () => {
      const setSelectedIndex = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        ...defaultSearchState,
        query: 'plc',
        isOpen: true,
        results: { posts: [mockPost], books: [], totalResults: 1 },
        flatResults: [{ type: 'post', item: mockPost }],
        selectedIndex: 0, // already at last (only 1 result)
        setSelectedIndex,
      });

      render(<SearchInput />);
      const input = screen.getByRole('combobox');
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      expect(setSelectedIndex).toHaveBeenCalledWith(0); // clamped to length - 1
    });
  });

  describe('Accessibility', () => {
    it('should have aria-expanded false when closed', () => {
      render(<SearchInput />);
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have aria-expanded true when open', () => {
      vi.mocked(useSearch).mockReturnValue({
        ...defaultSearchState,
        isOpen: true,
        query: 'plc',
        results: { posts: [mockPost], books: [], totalResults: 1 },
        flatResults: [{ type: 'post', item: mockPost }],
      });

      render(<SearchInput />);
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-label', () => {
      render(<SearchInput />);
      expect(screen.getByLabelText('Tìm kiếm')).toBeInTheDocument();
    });
  });

  describe('onResultClick callback', () => {
    it('should call onResultClick when a result is clicked', () => {
      const onResultClick = vi.fn();
      vi.mocked(useSearch).mockReturnValue({
        ...defaultSearchState,
        query: 'plc',
        isOpen: true,
        results: { posts: [mockPost], books: [], totalResults: 1 },
        flatResults: [{ type: 'post', item: mockPost }],
      });

      render(<SearchInput onResultClick={onResultClick} />);
      // The SearchResults component renders links; clicking one triggers onResultClick
      const link = screen.getByRole('link');
      fireEvent.click(link);

      expect(onResultClick).toHaveBeenCalled();
    });
  });
});
