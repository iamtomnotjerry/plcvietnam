/**
 * Post Detail Page Tests
 * Tests for post detail page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import PostPage, { generateStaticParams, generateMetadata } from './page';
import { contentRepository } from '@/lib/data/factory';
import type { Category, Field, Post, Author } from '@/lib/types/domain';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn(async (opts?: { namespace?: string } | string) => {
    const ns = typeof opts === 'string' ? opts : opts?.namespace;
    return (key: string) => {
      if (ns === 'errors' && key === 'postNotFoundTitle') return 'Không tìm thấy bài viết';
      if (ns === 'pages' && key === 'postJsonLd.authorName') return 'Trần Văn Hiếu';
      if (ns === 'nav' && key === 'home') return 'Trang chủ';
      if (ns === 'common' && key === 'fieldFallback') return 'Lĩnh vực';
      if (ns === 'common' && key === 'categoryFallback') return 'Danh mục';
      if (ns === 'site' && key === 'brand') return 'PLC Việt Nam';
      return key;
    };
  }),
}));

// Mock content repository
vi.mock('@/lib/data/factory', () => ({
  contentRepository: {
    getFields: vi.fn(),
    getCategoriesByFieldId: vi.fn(),
    getPostsByCategory: vi.fn(),
    getPostBySlug: vi.fn(),
    getRelatedPosts: vi.fn(),
  },
}));

// Mock PostDetail component
vi.mock('@/features/posts/components/PostDetail', () => ({
  PostDetail: ({ post, relatedPosts }: { post: Post; relatedPosts: Post[] }) => (
    <div data-testid="post-detail">
      <h1>{post.title}</h1>
      <div data-testid="related-count">{relatedPosts.length}</div>
    </div>
  ),
}));

describe('PostPage', () => {
  const mockAuthor: Author = {
    id: 'author-1',
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Expert in automation',
    expertise: ['PLC', 'SCADA'],
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
    description: 'Learn ladder logic programming',
    fieldId: 'field-1',
    field: mockField,
    postCount: 5,
    order: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockPost: Post = {
    id: 'post-1',
    slug: 'intro-ladder',
    title: 'Introduction to Ladder Logic',
    excerpt: 'Learn the basics of ladder logic programming',
    content: '<h2>What is Ladder Logic?</h2><p>Content here</p>',
    categoryId: 'cat-1',
    category: mockCategory,
    authorId: 'author-1',
    author: mockAuthor,
    tags: [
      { id: 'tag-1', slug: 'plc', name: 'PLC', postCount: 10 },
      { id: 'tag-2', slug: 'ladder', name: 'Ladder', postCount: 5 },
    ],
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    viewCount: 100,
    readingTimeMinutes: 5,
    seo: {
      title: 'Introduction to Ladder Logic - Complete Guide',
      description: 'Learn the basics of ladder logic programming',
      ogImage: '/images/ladder-logic.jpg',
      keywords: ['ladder logic', 'plc', 'programming'],
    },
  };

  const mockRelatedPosts: Post[] = [
    {
      ...mockPost,
      id: 'post-2',
      slug: 'advanced-ladder',
      title: 'Advanced Ladder Logic',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateStaticParams', () => {
    it('generates params for all field/category/post combinations', async () => {
      vi.mocked(contentRepository.getFields).mockResolvedValue([mockField]);
      vi.mocked(contentRepository.getCategoriesByFieldId).mockResolvedValue([mockCategory]);
      vi.mocked(contentRepository.getPostsByCategory).mockResolvedValue({
        data: [mockPost],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });

      const params = await generateStaticParams();

      expect(params).toEqual([
        { locale: 'vi', fieldSlug: 'plc', categorySlug: 'ladder-logic', postSlug: 'intro-ladder' },
        { locale: 'en', fieldSlug: 'plc', categorySlug: 'ladder-logic', postSlug: 'intro-ladder' },
      ]);
      expect(contentRepository.getFields).toHaveBeenCalledOnce();
      expect(contentRepository.getCategoriesByFieldId).toHaveBeenCalledWith('field-1');
      expect(contentRepository.getPostsByCategory).toHaveBeenCalledWith('cat-1');
    });
  });

  describe('generateMetadata', () => {
    it('generates metadata for valid post with SEO data', async () => {
      vi.mocked(contentRepository.getPostBySlug).mockResolvedValue(mockPost);

      const metadata = await generateMetadata({
        params: Promise.resolve({
          locale: 'vi',
          fieldSlug: 'plc',
          categorySlug: 'ladder-logic',
          postSlug: 'intro-ladder',
        }),
      });

      expect(metadata.title).toBe('Introduction to Ladder Logic - Complete Guide');
      expect(metadata.description).toBe('Learn the basics of ladder logic programming');
      expect(metadata.keywords).toEqual(['ladder logic', 'plc', 'programming']);
      expect(metadata.openGraph?.title).toBe('Introduction to Ladder Logic - Complete Guide');
      expect(metadata.openGraph?.images).toEqual(['/images/ladder-logic.jpg']);
      expect(metadata.openGraph?.type).toBe('article');
      expect(metadata.openGraph?.authors).toEqual(['John Doe']);
      expect(metadata.openGraph?.tags).toEqual(['PLC', 'Ladder']);
    });

    it('generates fallback metadata for post without SEO data', async () => {
      const postWithoutSEO = {
        ...mockPost,
        seo: {
          title: '',
          description: '',
          keywords: [],
        },
      };
      vi.mocked(contentRepository.getPostBySlug).mockResolvedValue(postWithoutSEO);

      const metadata = await generateMetadata({
        params: Promise.resolve({
          locale: 'vi',
          fieldSlug: 'plc',
          categorySlug: 'ladder-logic',
          postSlug: 'intro-ladder',
        }),
      });

      expect(metadata.title).toBe('Introduction to Ladder Logic');
      expect(metadata.description).toBe('Learn the basics of ladder logic programming');
    });

    it('generates fallback metadata for invalid post', async () => {
      vi.mocked(contentRepository.getPostBySlug).mockResolvedValue(null);

      const metadata = await generateMetadata({
        params: Promise.resolve({
          locale: 'vi',
          fieldSlug: 'invalid',
          categorySlug: 'invalid',
          postSlug: 'invalid',
        }),
      });

      expect(metadata.title).toBe('Không tìm thấy bài viết');
    });
  });

  describe('PostPage component', () => {
    it('renders post detail page with related posts', async () => {
      vi.mocked(contentRepository.getPostBySlug).mockResolvedValue(mockPost);
      vi.mocked(contentRepository.getRelatedPosts).mockResolvedValue(mockRelatedPosts);

      const Component = await PostPage({
        params: Promise.resolve({
          locale: 'vi',
          fieldSlug: 'plc',
          categorySlug: 'ladder-logic',
          postSlug: 'intro-ladder',
        }),
      });

      render(Component);

      expect(screen.getByTestId('post-detail')).toBeInTheDocument();
      expect(screen.getByText('Introduction to Ladder Logic')).toBeInTheDocument();
      expect(screen.getByTestId('related-count')).toHaveTextContent('1');
    });

    it('calls notFound for invalid post', async () => {
      const { notFound } = await import('next/navigation');
      vi.mocked(contentRepository.getPostBySlug).mockResolvedValue(null);

      await PostPage({
        params: Promise.resolve({
          locale: 'vi',
          fieldSlug: 'invalid',
          categorySlug: 'invalid',
          postSlug: 'invalid',
        }),
      });

      expect(notFound).toHaveBeenCalled();
    });

    it('fetches related posts with limit of 4', async () => {
      vi.mocked(contentRepository.getPostBySlug).mockResolvedValue(mockPost);
      vi.mocked(contentRepository.getRelatedPosts).mockResolvedValue(mockRelatedPosts);

      await PostPage({
        params: Promise.resolve({
          locale: 'vi',
          fieldSlug: 'plc',
          categorySlug: 'ladder-logic',
          postSlug: 'intro-ladder',
        }),
      });

      expect(contentRepository.getRelatedPosts).toHaveBeenCalledWith('post-1', 4);
    });

    it('passes correct props to PostDetail component', async () => {
      vi.mocked(contentRepository.getPostBySlug).mockResolvedValue(mockPost);
      vi.mocked(contentRepository.getRelatedPosts).mockResolvedValue(mockRelatedPosts);

      const Component = await PostPage({
        params: Promise.resolve({
          locale: 'vi',
          fieldSlug: 'plc',
          categorySlug: 'ladder-logic',
          postSlug: 'intro-ladder',
        }),
      });

      render(Component);

      expect(screen.getByTestId('post-detail')).toBeInTheDocument();
      expect(contentRepository.getPostBySlug).toHaveBeenCalledWith(
        'plc',
        'ladder-logic',
        'intro-ladder'
      );
    });
  });
});
