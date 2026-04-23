/**
 * PostCard Component Tests
 * Unit tests for PostCard component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostCard } from './PostCard';
import type { Post } from '@/lib/types/domain';

/**
 * Create a mock post for testing
 */
function createMockPost(overrides?: Partial<Post>): Post {
  return {
    id: 'post-1',
    slug: 'test-post',
    title: 'Test Post Title',
    excerpt: 'This is a test excerpt for the post.',
    content: '<p>Test content</p>',
    thumbnailUrl: '/images/test.jpg',
    categoryId: 'cat-1',
    category: {
      id: 'cat-1',
      slug: 'test-category',
      name: 'Test Category',
      description: 'Test category description',
      fieldId: 'field-1',
      field: {
        id: 'field-1',
        slug: 'test-field',
        name: 'Test Field',
        description: 'Test field description',
        postCount: 10,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      postCount: 5,
      order: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    authorId: 'author-1',
    tags: [],
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    viewCount: 0,
    readingTimeMinutes: 5,
    seo: {
      title: 'Test Post Title',
      description: 'Test description',
      keywords: ['test'],
    },
    ...overrides,
  };
}

describe('PostCard', () => {
  it('renders post title, excerpt, and metadata', () => {
    const post = createMockPost();
    render(<PostCard post={post} />);
    
    expect(screen.getByText(post.title)).toBeInTheDocument();
    expect(screen.getByText(post.excerpt)).toBeInTheDocument();
    expect(screen.getByText(/phút đọc/)).toBeInTheDocument();
  });
  
  it('displays category badge when showCategory is true', () => {
    const post = createMockPost();
    render(<PostCard post={post} showCategory={true} />);
    
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });
  
  it('hides category badge when showCategory is false', () => {
    const post = createMockPost();
    render(<PostCard post={post} showCategory={false} />);
    
    expect(screen.queryByText('Test Category')).not.toBeInTheDocument();
  });
  
  it('displays reading time in minutes', () => {
    const post = createMockPost({ readingTimeMinutes: 7 });
    render(<PostCard post={post} />);
    
    expect(screen.getByText('7 phút đọc')).toBeInTheDocument();
  });
  
  it('truncates long excerpts to 200 characters', () => {
    const longExcerpt = 'A'.repeat(250);
    const post = createMockPost({ excerpt: longExcerpt });
    render(<PostCard post={post} />);
    
    const excerptElement = screen.getByText(/A+\.\.\./);
    expect(excerptElement.textContent?.length).toBeLessThanOrEqual(204); // 200 + '...'
  });
  
  it('renders correct link URL', () => {
    const post = createMockPost();
    render(<PostCard post={post} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/fields/test-field/test-category/test-post');
  });
  
  it('applies compact variant styles', () => {
    const post = createMockPost();
    const { container } = render(<PostCard post={post} variant="compact" />);
    
    const title = screen.getByText(post.title);
    expect(title).toHaveClass('text-base');
  });
  
  it('applies featured variant styles', () => {
    const post = createMockPost();
    const { container } = render(<PostCard post={post} variant="featured" />);
    
    const title = screen.getByText(post.title);
    expect(title).toHaveClass('text-2xl');
  });
  
  it('formats date in Vietnamese locale', () => {
    const post = createMockPost({
      publishedAt: new Date('2024-03-15T10:00:00Z'),
    });
    render(<PostCard post={post} />);
    
    // Check for Vietnamese month name
    expect(screen.getByText(/tháng 3/i)).toBeInTheDocument();
  });
  
  it('handles missing thumbnail gracefully', () => {
    const post = createMockPost({ thumbnailUrl: undefined });
    render(<PostCard post={post} showThumbnail={true} />);
    
    // Should still render without errors
    expect(screen.getByText(post.title)).toBeInTheDocument();
  });
  
  it('hides thumbnail when showThumbnail is false', () => {
    const post = createMockPost();
    const { container } = render(<PostCard post={post} showThumbnail={false} />);
    
    const images = container.querySelectorAll('img');
    expect(images.length).toBe(0);
  });
});
