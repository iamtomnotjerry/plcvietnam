/**
 * TagPageClient Component Tests
 * Unit tests for tag page client component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TagPageClient } from './TagPageClient';
import type { Post } from '@/lib/types/domain';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock PostList component
vi.mock('@/features/posts/components/PostList', () => ({
  PostList: ({ posts, pagination }: any) => (
    <div data-testid="post-list">
      <div data-testid="post-count">{posts.length}</div>
      <div data-testid="current-page">{pagination.page}</div>
      <div data-testid="total-pages">{pagination.totalPages}</div>
      <button
        data-testid="page-change-btn"
        onClick={() => pagination.onPageChange(2)}
      >
        Go to page 2
      </button>
    </div>
  ),
}));

describe('TagPageClient', () => {
  const mockPosts: Post[] = [
    {
      id: '1',
      slug: 'post-1',
      title: 'Test Post 1',
      excerpt: 'Excerpt 1',
      content: 'Content 1',
      categoryId: 'cat-1',
      authorId: 'author-1',
      tags: [],
      publishedAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      viewCount: 0,
      readingTimeMinutes: 5,
      seo: {
        title: 'Test Post 1',
        description: 'Excerpt 1',
        keywords: [],
      },
    },
    {
      id: '2',
      slug: 'post-2',
      title: 'Test Post 2',
      excerpt: 'Excerpt 2',
      content: 'Content 2',
      categoryId: 'cat-1',
      authorId: 'author-1',
      tags: [],
      publishedAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      viewCount: 0,
      readingTimeMinutes: 3,
      seo: {
        title: 'Test Post 2',
        description: 'Excerpt 2',
        keywords: [],
      },
    },
  ];

  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders PostList with correct props', () => {
    render(
      <TagPageClient
        tagSlug="test-tag"
        posts={mockPosts}
        pagination={{
          page: 1,
          totalPages: 3,
          total: 50,
        }}
      />
    );

    expect(screen.getByTestId('post-list')).toBeInTheDocument();
    expect(screen.getByTestId('post-count')).toHaveTextContent('2');
    expect(screen.getByTestId('current-page')).toHaveTextContent('1');
    expect(screen.getByTestId('total-pages')).toHaveTextContent('3');
  });

  it('handles page change with router.push', () => {
    render(
      <TagPageClient
        tagSlug="automation"
        posts={mockPosts}
        pagination={{
          page: 1,
          totalPages: 3,
          total: 50,
        }}
      />
    );

    const button = screen.getByTestId('page-change-btn');
    button.click();

    expect(mockPush).toHaveBeenCalledWith('/tags/automation?page=2');
  });

  it('renders with empty posts array', () => {
    render(
      <TagPageClient
        tagSlug="empty-tag"
        posts={[]}
        pagination={{
          page: 1,
          totalPages: 1,
          total: 0,
        }}
      />
    );

    expect(screen.getByTestId('post-list')).toBeInTheDocument();
    expect(screen.getByTestId('post-count')).toHaveTextContent('0');
  });

  it('handles different tag slugs correctly', () => {
    const { rerender } = render(
      <TagPageClient
        tagSlug="tag-one"
        posts={mockPosts}
        pagination={{
          page: 1,
          totalPages: 2,
          total: 30,
        }}
      />
    );

    const button = screen.getByTestId('page-change-btn');
    button.click();
    expect(mockPush).toHaveBeenCalledWith('/tags/tag-one?page=2');

    mockPush.mockClear();

    rerender(
      <TagPageClient
        tagSlug="tag-two"
        posts={mockPosts}
        pagination={{
          page: 1,
          totalPages: 2,
          total: 30,
        }}
      />
    );

    button.click();
    expect(mockPush).toHaveBeenCalledWith('/tags/tag-two?page=2');
  });
});
