/**
 * RecentPostsSection Component Tests
 * Validates Requirements: 11.3
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentPostsSection } from './RecentPostsSection';
import type { Post } from '@/lib/types/domain';

describe('RecentPostsSection', () => {
  const mockPosts: Post[] = Array.from({ length: 8 }, (_, i) => ({
    id: `post-${i + 1}`,
    slug: `post-${i + 1}`,
    title: `Post ${i + 1}`,
    excerpt: `Excerpt for post ${i + 1}`,
    content: 'Content',
    categoryId: 'cat-1',
    category: {
      id: 'cat-1',
      slug: 'category-1',
      name: 'Category 1',
      description: 'Description',
      fieldId: 'field-1',
      field: {
        id: 'field-1',
        slug: 'field-1',
        name: 'Field 1',
        description: 'Description',
        postCount: 10,
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
    publishedAt: new Date(),
    updatedAt: new Date(),
    viewCount: 0,
    readingTimeMinutes: 5,
    seo: {
      title: `Post ${i + 1}`,
      description: `Excerpt for post ${i + 1}`,
      keywords: [],
    },
  }));

  it('renders section heading', () => {
    render(<RecentPostsSection posts={mockPosts} />);
    
    expect(screen.getByRole('heading', { level: 2, name: 'Bài viết mới nhất' })).toBeInTheDocument();
  });

  it('displays maximum 6 posts', () => {
    render(<RecentPostsSection posts={mockPosts} />);
    
    // Should only show 6 posts even though 8 were provided
    const postCards = screen.getAllByRole('link').filter(link => 
      link.getAttribute('href')?.includes('/fields/')
    );
    expect(postCards.length).toBe(6);
  });

  it('displays all posts when less than 6 provided', () => {
    const threePosts = mockPosts.slice(0, 3);
    render(<RecentPostsSection posts={threePosts} />);
    
    const postCards = screen.getAllByRole('link').filter(link => 
      link.getAttribute('href')?.includes('/fields/')
    );
    expect(postCards.length).toBe(3);
  });

  it('renders nothing when no posts provided', () => {
    const { container } = render(<RecentPostsSection posts={[]} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('renders post titles', () => {
    const threePosts = mockPosts.slice(0, 3);
    render(<RecentPostsSection posts={threePosts} />);
    
    expect(screen.getByText('Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post 2')).toBeInTheDocument();
    expect(screen.getByText('Post 3')).toBeInTheDocument();
  });
});
