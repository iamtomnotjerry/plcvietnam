/**
 * PostDetail Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostDetail } from './PostDetail';
import type { Post, Author, Category, Field } from '@/lib/types/domain';

vi.mock('@/features/auth/hooks/useAdminRole', () => ({
  useAdminRole: () => ({ role: null, isEditor: false, loading: false }),
}));

// Mock child components
vi.mock('./PostContent', () => ({
  PostContent: ({ content }: { content: string }) => (
    <div data-testid="post-content">{content}</div>
  ),
}));

vi.mock('./TableOfContents', () => ({
  TableOfContents: () => <div data-testid="table-of-contents">TOC</div>,
}));

vi.mock('./RelatedPosts', () => ({
  RelatedPosts: ({ posts }: { posts: Post[] }) => (
    <div data-testid="related-posts">Related: {posts.length}</div>
  ),
}));

vi.mock('./SocialShare', () => ({
  SocialShare: () => <div data-testid="social-share">Share</div>,
}));

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

describe('PostDetail', () => {
  const mockAuthor: Author = {
    id: 'author-1',
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Author bio',
    avatarUrl: '/avatar.jpg',
    expertise: [],
    certifications: [],
    socialLinks: {},
  };

  const mockField: Field = {
    id: 'field-1',
    slug: 'plc',
    name: 'PLC Programming',
    description: 'PLC description',
    postCount: 10,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockCategory: Category = {
    id: 'cat-1',
    slug: 'ladder-logic',
    name: 'Ladder Logic',
    description: 'Category description',
    fieldId: 'field-1',
    field: mockField,
    postCount: 5,
    order: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPost: Post = {
    id: 'post-1',
    slug: 'test-post',
    title: 'Test Post Title',
    excerpt: 'Test excerpt',
    content: '<h2>Section 1</h2><p>Content</p>',
    categoryId: 'cat-1',
    category: mockCategory,
    authorId: 'author-1',
    author: mockAuthor,
    tags: [
      { id: 'tag-1', slug: 'plc', name: 'PLC', postCount: 10 },
      { id: 'tag-2', slug: 'automation', name: 'Automation', postCount: 15 },
    ],
    publishedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    viewCount: 1234,
    readingTimeMinutes: 5,
    seo: {
      title: 'Test Post Title',
      description: 'Test excerpt',
      keywords: [],
    },
  };

  const mockRelatedPosts: Post[] = [];

  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: 'https://example.com/post' },
      writable: true,
    });
  });

  it('renders breadcrumb navigation', () => {
    render(<PostDetail post={mockPost} relatedPosts={mockRelatedPosts} />);

    expect(screen.getByText('Trang chủ')).toBeInTheDocument();
    expect(screen.getByText('PLC Programming')).toBeInTheDocument();
    expect(screen.getByText('Ladder Logic')).toBeInTheDocument();
    // Use getAllByText since title appears in both breadcrumb and heading
    expect(screen.getAllByText('Test Post Title')).toHaveLength(2);
  });

  it('renders post title', () => {
    render(<PostDetail post={mockPost} relatedPosts={mockRelatedPosts} />);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveTextContent('Test Post Title');
  });

  it('renders author information', () => {
    render(<PostDetail post={mockPost} relatedPosts={mockRelatedPosts} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByAltText('John Doe')).toBeInTheDocument();
  });

  it('renders publication date', () => {
    render(<PostDetail post={mockPost} relatedPosts={mockRelatedPosts} />);

    // Vietnamese date format
    expect(screen.getByText(/15 tháng 1, 2024/i)).toBeInTheDocument();
  });

  it('renders reading time', () => {
    render(<PostDetail post={mockPost} relatedPosts={mockRelatedPosts} />);

    expect(screen.getByText('5 phút đọc')).toBeInTheDocument();
  });

  it('renders view count', () => {
    render(<PostDetail post={mockPost} relatedPosts={mockRelatedPosts} />);

    expect(screen.getByText('1.234 lượt xem')).toBeInTheDocument();
  });

  it('renders social share component', () => {
    render(<PostDetail post={mockPost} relatedPosts={mockRelatedPosts} />);

    expect(screen.getByTestId('social-share')).toBeInTheDocument();
  });

  it('renders post content', () => {
    render(<PostDetail post={mockPost} relatedPosts={mockRelatedPosts} />);

    expect(screen.getByTestId('post-content')).toBeInTheDocument();
  });

  it('renders table of contents', () => {
    render(<PostDetail post={mockPost} relatedPosts={mockRelatedPosts} />);

    expect(screen.getByTestId('table-of-contents')).toBeInTheDocument();
  });

  it('renders tags section', () => {
    render(<PostDetail post={mockPost} relatedPosts={mockRelatedPosts} />);

    expect(screen.getByText('Thẻ:')).toBeInTheDocument();
    expect(screen.getByText('#PLC')).toBeInTheDocument();
    expect(screen.getByText('#Automation')).toBeInTheDocument();
  });

  it('renders tag links with correct href', () => {
    render(<PostDetail post={mockPost} relatedPosts={mockRelatedPosts} />);

    const plcLink = screen.getByText('#PLC').closest('a');
    expect(plcLink).toHaveAttribute('href', '/tags/plc');

    const automationLink = screen.getByText('#Automation').closest('a');
    expect(automationLink).toHaveAttribute('href', '/tags/automation');
  });

  it('does not render tags section when post has no tags', () => {
    const postWithoutTags = { ...mockPost, tags: [] };
    render(<PostDetail post={postWithoutTags} relatedPosts={mockRelatedPosts} />);

    expect(screen.queryByText('Thẻ:')).not.toBeInTheDocument();
  });

  it('renders related posts component', () => {
    const relatedPosts = [mockPost];
    render(<PostDetail post={mockPost} relatedPosts={relatedPosts} />);

    expect(screen.getByTestId('related-posts')).toBeInTheDocument();
    expect(screen.getByText('Related: 1')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PostDetail post={mockPost} relatedPosts={mockRelatedPosts} className="custom-class" />
    );

    const article = container.querySelector('article');
    expect(article).toHaveClass('custom-class');
  });

  it('renders without author avatar when not provided', () => {
    const postWithoutAvatar = {
      ...mockPost,
      author: { ...mockAuthor, avatarUrl: undefined },
    };

    render(<PostDetail post={postWithoutAvatar} relatedPosts={mockRelatedPosts} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByAltText('John Doe')).not.toBeInTheDocument();
  });

  it('renders without author when not provided', () => {
    const postWithoutAuthor = { ...mockPost, author: undefined };

    render(<PostDetail post={postWithoutAuthor} relatedPosts={mockRelatedPosts} />);

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });
});
