/**
 * RelatedPosts Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RelatedPosts } from './RelatedPosts';
import type { Post } from '@/lib/types/domain';

// Mock PostCard component
vi.mock('./PostCard', () => ({
  PostCard: ({ post }: { post: Post }) => (
    <div data-testid={`post-card-${post.id}`}>{post.title}</div>
  ),
}));

describe('RelatedPosts', () => {
  const mockPosts: Post[] = [
    {
      id: '1',
      slug: 'post-1',
      title: 'Related Post 1',
      excerpt: 'Excerpt 1',
      content: 'Content 1',
      categoryId: 'cat-1',
      authorId: 'author-1',
      tags: [],
      publishedAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      viewCount: 100,
      readingTimeMinutes: 5,
      seo: {
        title: 'Related Post 1',
        description: 'Excerpt 1',
        keywords: [],
      },
    },
    {
      id: '2',
      slug: 'post-2',
      title: 'Related Post 2',
      excerpt: 'Excerpt 2',
      content: 'Content 2',
      categoryId: 'cat-1',
      authorId: 'author-1',
      tags: [],
      publishedAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      viewCount: 200,
      readingTimeMinutes: 7,
      seo: {
        title: 'Related Post 2',
        description: 'Excerpt 2',
        keywords: [],
      },
    },
    {
      id: '3',
      slug: 'post-3',
      title: 'Related Post 3',
      excerpt: 'Excerpt 3',
      content: 'Content 3',
      categoryId: 'cat-1',
      authorId: 'author-1',
      tags: [],
      publishedAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      viewCount: 300,
      readingTimeMinutes: 10,
      seo: {
        title: 'Related Post 3',
        description: 'Excerpt 3',
        keywords: [],
      },
    },
    {
      id: '4',
      slug: 'post-4',
      title: 'Related Post 4',
      excerpt: 'Excerpt 4',
      content: 'Content 4',
      categoryId: 'cat-1',
      authorId: 'author-1',
      tags: [],
      publishedAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-04'),
      viewCount: 400,
      readingTimeMinutes: 8,
      seo: {
        title: 'Related Post 4',
        description: 'Excerpt 4',
        keywords: [],
      },
    },
  ];
  
  it('renders section heading', () => {
    render(<RelatedPosts posts={mockPosts} />);
    
    expect(screen.getByText('Bài viết liên quan')).toBeInTheDocument();
  });
  
  it('renders all related posts', () => {
    render(<RelatedPosts posts={mockPosts} />);
    
    mockPosts.forEach((post) => {
      expect(screen.getByTestId(`post-card-${post.id}`)).toBeInTheDocument();
    });
  });
  
  it('renders posts in grid layout', () => {
    const { container } = render(<RelatedPosts posts={mockPosts} />);
    
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
  });
  
  it('does not render when posts array is empty', () => {
    const { container } = render(<RelatedPosts posts={[]} />);
    
    expect(container.firstChild).toBeNull();
  });
  
  it('renders with single post', () => {
    render(<RelatedPosts posts={[mockPosts[0]]} />);
    
    expect(screen.getByText('Bài viết liên quan')).toBeInTheDocument();
    expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
  });
  
  it('renders with maximum 4 posts', () => {
    render(<RelatedPosts posts={mockPosts} />);
    
    expect(screen.getAllByTestId(/post-card-/)).toHaveLength(4);
  });
  
  it('applies custom className', () => {
    const { container } = render(
      <RelatedPosts posts={mockPosts} className="custom-class" />
    );
    
    const section = container.firstChild;
    expect(section).toHaveClass('custom-class');
  });
});
