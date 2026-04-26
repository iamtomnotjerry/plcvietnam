/**
 * Homepage Tests
 * Tests for the homepage route component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './page';

// Mock the contentRepository
vi.mock('@/lib/data/factory', () => ({
  contentRepository: {
    getRecentPosts: vi.fn(),
    getFields: vi.fn(),
    getFeaturedBooks: vi.fn(),
    getCategoriesByFieldId: vi.fn(),
  },
}));

// Mock the homepage components
vi.mock('@/features/homepage/components', () => ({
  HeroSection: ({ title, tagline }: { title: string; tagline: string }) => (
    <div data-testid="hero-section">
      <h1>{title}</h1>
      <p>{tagline}</p>
    </div>
  ),
  RecentPostsSection: ({ posts }: { posts: any[] }) => (
    <div data-testid="recent-posts-section">{posts.length} posts</div>
  ),
  FieldsSection: ({ fields }: { fields: any[] }) => (
    <div data-testid="fields-section">{fields.length} fields</div>
  ),
  FeaturedBooksSection: ({ books }: { books: any[] }) => (
    <div data-testid="featured-books-section">{books.length} books</div>
  ),
}));

import { contentRepository } from '@/lib/data/factory';

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    vi.mocked(contentRepository.getRecentPosts).mockResolvedValue([
      {
        id: 'post-1',
        slug: 'test-post',
        title: 'Test Post',
        excerpt: 'Test excerpt',
        content: 'Test content',
        categoryId: 'cat-1',
        category: {
          id: 'cat-1',
          slug: 'test-category',
          name: 'Test Category',
          description: 'Test',
          fieldId: 'field-1',
          field: {
            id: 'field-1',
            slug: 'test-field',
            name: 'Test Field',
            description: 'Test',
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
        publishedAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        readingTimeMinutes: 5,
        seo: {
          title: 'Test',
          description: 'Test',
          keywords: [],
        },
      },
    ]);

    vi.mocked(contentRepository.getFields).mockResolvedValue([
      {
        id: 'field-1',
        slug: 'test-field',
        name: 'Test Field',
        description: 'Test field description',
        postCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    vi.mocked(contentRepository.getFeaturedBooks).mockResolvedValue([
      {
        id: 'book-1',
        slug: 'test-book',
        title: 'Test Book',
        description: 'Test book description',
        coverImageUrl: '/test.jpg',
        authorName: 'Test Author',
        createdAt: new Date(),
      },
    ]);

    vi.mocked(contentRepository.getCategoriesByFieldId).mockResolvedValue([
      {
        id: 'cat-1',
        slug: 'test-category',
        name: 'Test Category',
        description: 'Test',
        fieldId: 'field-1',
        postCount: 1,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  });

  it('renders the homepage with hero section', async () => {
    const page = await HomePage();
    render(page);

    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByText('PLC Việt Nam')).toBeInTheDocument();
    expect(screen.getByText('Cộng đồng kỹ sư tự động hóa Việt Nam')).toBeInTheDocument();
  });

  it('renders all homepage sections', async () => {
    const page = await HomePage();
    render(page);

    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('recent-posts-section')).toBeInTheDocument();
    expect(screen.getByTestId('fields-section')).toBeInTheDocument();
    expect(screen.getByTestId('featured-books-section')).toBeInTheDocument();
  });

  it('fetches and displays recent posts', async () => {
    const page = await HomePage();
    render(page);

    expect(contentRepository.getRecentPosts).toHaveBeenCalledWith(6);
    expect(screen.getByText('1 posts')).toBeInTheDocument();
  });

  it('fetches and displays fields with first category', async () => {
    const page = await HomePage();
    render(page);

    expect(contentRepository.getFields).toHaveBeenCalled();
    expect(contentRepository.getCategoriesByFieldId).toHaveBeenCalledWith('field-1');
    expect(screen.getByText('1 fields')).toBeInTheDocument();
  });

  it('fetches and displays featured books', async () => {
    const page = await HomePage();
    render(page);

    expect(contentRepository.getFeaturedBooks).toHaveBeenCalledWith(3);
    expect(screen.getByText('1 books')).toBeInTheDocument();
  });
});
