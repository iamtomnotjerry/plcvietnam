/**
 * PostList Component Tests
 * Unit tests for PostList component with pagination
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostList } from './PostList';
import type { Post } from '@/lib/types/domain';

/**
 * Create a mock post for testing
 */
function createMockPost(id: string, title: string): Post {
  return {
    id,
    slug: `post-${id}`,
    title,
    excerpt: `Excerpt for ${title}`,
    content: '<p>Test content</p>',
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
      title,
      description: 'Test description',
      keywords: ['test'],
    },
  };
}

describe('PostList', () => {
  it('renders list of posts', () => {
    const posts = [
      createMockPost('1', 'Post 1'),
      createMockPost('2', 'Post 2'),
      createMockPost('3', 'Post 3'),
    ];
    
    render(<PostList posts={posts} />);
    
    expect(screen.getByText('Post 1')).toBeInTheDocument();
    expect(screen.getByText('Post 2')).toBeInTheDocument();
    expect(screen.getByText('Post 3')).toBeInTheDocument();
  });
  
  it('displays empty state when no posts', () => {
    render(<PostList posts={[]} />);
    
    expect(screen.getByText('Chưa có bài viết nào')).toBeInTheDocument();
    expect(screen.getByText(/Hiện tại chưa có bài viết nào/)).toBeInTheDocument();
  });
  
  it('renders pagination when provided', () => {
    const posts = [createMockPost('1', 'Post 1')];
    const pagination = {
      page: 1,
      totalPages: 5,
      onPageChange: vi.fn(),
    };
    
    render(<PostList posts={posts} pagination={pagination} />);
    
    // Check for page numbers
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
  
  it('does not render pagination when totalPages is 1', () => {
    const posts = [createMockPost('1', 'Post 1')];
    const pagination = {
      page: 1,
      totalPages: 1,
      onPageChange: vi.fn(),
    };
    
    render(<PostList posts={posts} pagination={pagination} />);
    
    // Pagination should not be visible
    expect(screen.queryByLabelText('Trang trước')).not.toBeInTheDocument();
  });
  
  it('calls onPageChange when page number is clicked', async () => {
    const user = userEvent.setup();
    const posts = [createMockPost('1', 'Post 1')];
    const onPageChange = vi.fn();
    const pagination = {
      page: 1,
      totalPages: 5,
      onPageChange,
    };
    
    render(<PostList posts={posts} pagination={pagination} />);
    
    const page3Button = screen.getByText('3');
    await user.click(page3Button);
    
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
  
  it('calls onPageChange when next button is clicked', async () => {
    const user = userEvent.setup();
    const posts = [createMockPost('1', 'Post 1')];
    const onPageChange = vi.fn();
    const pagination = {
      page: 2,
      totalPages: 5,
      onPageChange,
    };
    
    render(<PostList posts={posts} pagination={pagination} />);
    
    const nextButton = screen.getByLabelText('Trang sau');
    await user.click(nextButton);
    
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
  
  it('calls onPageChange when previous button is clicked', async () => {
    const user = userEvent.setup();
    const posts = [createMockPost('1', 'Post 1')];
    const onPageChange = vi.fn();
    const pagination = {
      page: 3,
      totalPages: 5,
      onPageChange,
    };
    
    render(<PostList posts={posts} pagination={pagination} />);
    
    const prevButton = screen.getByLabelText('Trang trước');
    await user.click(prevButton);
    
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
  
  it('disables previous button on first page', () => {
    const posts = [createMockPost('1', 'Post 1')];
    const pagination = {
      page: 1,
      totalPages: 5,
      onPageChange: vi.fn(),
    };
    
    render(<PostList posts={posts} pagination={pagination} />);
    
    const prevButton = screen.getByLabelText('Trang trước');
    expect(prevButton).toBeDisabled();
  });
  
  it('disables next button on last page', () => {
    const posts = [createMockPost('1', 'Post 1')];
    const pagination = {
      page: 5,
      totalPages: 5,
      onPageChange: vi.fn(),
    };
    
    render(<PostList posts={posts} pagination={pagination} />);
    
    const nextButton = screen.getByLabelText('Trang sau');
    expect(nextButton).toBeDisabled();
  });
  
  it('highlights current page', () => {
    const posts = [createMockPost('1', 'Post 1')];
    const pagination = {
      page: 3,
      totalPages: 5,
      onPageChange: vi.fn(),
    };
    
    render(<PostList posts={posts} pagination={pagination} />);
    
    const page3Button = screen.getByText('3');
    expect(page3Button).toHaveClass('bg-primary');
  });
  
  it('shows ellipsis for large page counts', () => {
    const posts = [createMockPost('1', 'Post 1')];
    const pagination = {
      page: 5,
      totalPages: 20,
      onPageChange: vi.fn(),
    };
    
    render(<PostList posts={posts} pagination={pagination} />);
    
    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThan(0);
  });
  
  it('applies compact variant to post cards', () => {
    const posts = [createMockPost('1', 'Post 1')];
    const { container } = render(<PostList posts={posts} variant="compact" />);
    
    // Check grid has more columns for compact variant
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('xl:grid-cols-4');
  });
  
  it('passes showCategory prop to PostCard', () => {
    const posts = [createMockPost('1', 'Post 1')];
    render(<PostList posts={posts} showCategory={false} />);
    
    // Category should not be visible
    expect(screen.queryByText('Test Category')).not.toBeInTheDocument();
  });
});
