/**
 * Homepage Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './page';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn(async (opts?: { namespace?: string } | string) => {
    const ns = typeof opts === 'string' ? opts : opts?.namespace;
    return (key: string) => {
      if (ns === 'site' && key === 'brand') return 'PLC Việt Nam';
      if (ns === 'home') {
        const home: Record<string, string> = {
          title: 'PLC Việt Nam',
          tagline: 'Cộng đồng kỹ sư tự động hóa Việt Nam',
          description: 'desc',
          emptyTitle: 'empty',
          emptyBody: 'empty body',
          loadErrorTitle: 'err',
          loadErrorUnknown: 'unknown',
        };
        return home[key] ?? key;
      }
      return key;
    };
  }),
}));

const homeParams = Promise.resolve({ locale: 'vi' });

// Mock the contentRepository
vi.mock('@/lib/data/factory', () => ({
  contentRepository: {
    getRecentPosts: vi.fn(),
    getFieldsWithFirstCategory: vi.fn(),
    getFeaturedBooks: vi.fn(),
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
  RecentPostsSection: ({ posts }: { posts: unknown[] }) => (
    <div data-testid="recent-posts-section">{posts.length} posts</div>
  ),
  FieldsSection: ({ fields }: { fields: unknown[] }) => (
    <div data-testid="fields-section">{fields.length} fields</div>
  ),
  FeaturedBooksSection: ({ books }: { books: unknown[] }) => (
    <div data-testid="featured-books-section">{books.length} books</div>
  ),
}));

import { contentRepository } from '@/lib/data/factory';

const mockField = {
  id: 'field-1',
  slug: 'test-field',
  name: 'Test Field',
  description: 'Test field description',
  postCount: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  firstCategorySlug: 'test-category',
};

const mockPost = {
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
    field: mockField,
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
  seo: { title: 'Test', description: 'Test', keywords: [] },
};

const mockBook = {
  id: 'book-1',
  slug: 'test-book',
  title: 'Test Book',
  description: 'Test book description',
  coverImageUrl: '/test.jpg',
  authorName: 'Test Author',
  createdAt: new Date(),
};

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(contentRepository.getRecentPosts).mockResolvedValue([mockPost]);
    vi.mocked(contentRepository.getFieldsWithFirstCategory).mockResolvedValue([mockField]);
    vi.mocked(contentRepository.getFeaturedBooks).mockResolvedValue([mockBook]);
  });

  it('renders the homepage with hero section', async () => {
    const page = await HomePage({ params: homeParams });
    render(page);

    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByText('PLC Việt Nam')).toBeInTheDocument();
    expect(screen.getByText('Cộng đồng kỹ sư tự động hóa Việt Nam')).toBeInTheDocument();
  });

  it('renders all homepage sections', async () => {
    const page = await HomePage({ params: homeParams });
    render(page);

    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('recent-posts-section')).toBeInTheDocument();
    expect(screen.getByTestId('fields-section')).toBeInTheDocument();
    expect(screen.getByTestId('featured-books-section')).toBeInTheDocument();
  });

  it('fetches and displays recent posts', async () => {
    const page = await HomePage({ params: homeParams });
    render(page);

    expect(contentRepository.getRecentPosts).toHaveBeenCalledWith(6);
    expect(screen.getByText('1 posts')).toBeInTheDocument();
  });

  it('fetches and displays fields with first category', async () => {
    const page = await HomePage({ params: homeParams });
    render(page);

    expect(contentRepository.getFieldsWithFirstCategory).toHaveBeenCalled();
    expect(screen.getByText('1 fields')).toBeInTheDocument();
  });

  it('fetches and displays featured books', async () => {
    const page = await HomePage({ params: homeParams });
    render(page);

    expect(contentRepository.getFeaturedBooks).toHaveBeenCalledWith(3);
    expect(screen.getByText('1 books')).toBeInTheDocument();
  });
});
