/**
 * Category Page Tests
 * Tests for category listing page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryPage, { generateStaticParams, generateMetadata } from './page';
import { contentRepository } from '@/lib/data/factory';
import type { Category, Field, Post } from '@/lib/types/domain';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn(async (opts?: { namespace?: string } | string) => {
    const ns = typeof opts === 'string' ? opts : opts?.namespace;
    return (key: string, values?: Record<string, string | number>) => {
      if (ns === 'errors' && key === 'categoryNotFoundTitle') return 'Không tìm thấy danh mục';
      if (ns === 'pages' && key === 'category.metaTitle') {
        return `${values?.name} - ${values?.fieldName} | PLC Việt Nam`;
      }
      if (ns === 'pages' && key === 'category.metaDescriptionFallback') {
        return `Mô tả thay thế ${values?.name}`;
      }
      if (ns === 'site' && key === 'brand') return 'PLC Việt Nam';
      if (ns === 'nav' && key === 'home') return 'Trang chủ';
      if (ns === 'common' && key === 'breadcrumbAria') return 'Thanh điều hướng';
      if (ns === 'common' && key === 'postCount') return `${values?.count} bài viết`;
      return key;
    };
  }),
}));

// Mock content repository
vi.mock('@/lib/data/factory', () => ({
  contentRepository: {
    getFields: vi.fn(),
    getCategoriesByFieldId: vi.fn(),
    getCategoryBySlug: vi.fn(),
    getPostsByCategory: vi.fn(),
  },
}));

// Mock PostList component
vi.mock('@/features/posts/components/PostList', () => ({
  PostList: ({ posts }: { posts: Post[] }) => (
    <div data-testid="post-list">
      {posts.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  ),
}));

describe('CategoryPage', () => {
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

  const mockPosts: Post[] = [
    {
      id: 'post-1',
      slug: 'intro-ladder',
      title: 'Introduction to Ladder Logic',
      excerpt: 'Learn the basics',
      content: '<p>Content</p>',
      categoryId: 'cat-1',
      category: mockCategory,
      authorId: 'author-1',
      tags: [],
      publishedAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      viewCount: 100,
      readingTimeMinutes: 5,
      seo: {
        title: 'Introduction to Ladder Logic',
        description: 'Learn the basics',
        keywords: ['ladder', 'plc'],
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateStaticParams', () => {
    it('generates params for all field/category combinations', async () => {
      vi.mocked(contentRepository.getFields).mockResolvedValue([mockField]);
      vi.mocked(contentRepository.getCategoriesByFieldId).mockResolvedValue([mockCategory]);

      const params = await generateStaticParams();

      expect(params).toEqual([
        { locale: 'vi', fieldSlug: 'plc', categorySlug: 'ladder-logic' },
        { locale: 'en', fieldSlug: 'plc', categorySlug: 'ladder-logic' },
      ]);
      expect(contentRepository.getFields).toHaveBeenCalledOnce();
      expect(contentRepository.getCategoriesByFieldId).toHaveBeenCalledWith('field-1');
    });
  });

  describe('generateMetadata', () => {
    it('generates metadata for valid category', async () => {
      vi.mocked(contentRepository.getCategoryBySlug).mockResolvedValue(mockCategory);

      const metadata = await generateMetadata({
        params: Promise.resolve({ locale: 'vi', fieldSlug: 'plc', categorySlug: 'ladder-logic' }),
      });

      expect(metadata.title).toBe('Ladder Logic - PLC Programming | PLC Việt Nam');
      expect(metadata.description).toBe('Learn ladder logic programming');
    });

    it('generates fallback metadata for invalid category', async () => {
      vi.mocked(contentRepository.getCategoryBySlug).mockResolvedValue(null);

      const metadata = await generateMetadata({
        params: Promise.resolve({ locale: 'vi', fieldSlug: 'invalid', categorySlug: 'invalid' }),
      });

      expect(metadata.title).toBe('Không tìm thấy danh mục');
    });
  });

  describe('CategoryPage component', () => {
    it('renders category page with posts', async () => {
      vi.mocked(contentRepository.getCategoryBySlug).mockResolvedValue(mockCategory);
      vi.mocked(contentRepository.getPostsByCategory).mockResolvedValue({
        data: mockPosts,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });

      const Component = await CategoryPage({
        params: Promise.resolve({ locale: 'vi', fieldSlug: 'plc', categorySlug: 'ladder-logic' }),
      });

      render(Component);

      expect(screen.getByRole('heading', { name: 'Ladder Logic' })).toBeInTheDocument();
      expect(screen.getByText('Learn ladder logic programming')).toBeInTheDocument();
      expect(screen.getByText('5 bài viết')).toBeInTheDocument();
      expect(screen.getByTestId('post-list')).toBeInTheDocument();
    });

    it('calls notFound for invalid category', async () => {
      const { notFound } = await import('next/navigation');
      vi.mocked(contentRepository.getCategoryBySlug).mockResolvedValue(null);

      await CategoryPage({
        params: Promise.resolve({ locale: 'vi', fieldSlug: 'invalid', categorySlug: 'invalid' }),
      });

      expect(notFound).toHaveBeenCalled();
    });

    it('renders breadcrumb navigation', async () => {
      vi.mocked(contentRepository.getCategoryBySlug).mockResolvedValue(mockCategory);
      vi.mocked(contentRepository.getPostsByCategory).mockResolvedValue({
        data: mockPosts,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });

      const Component = await CategoryPage({
        params: Promise.resolve({ locale: 'vi', fieldSlug: 'plc', categorySlug: 'ladder-logic' }),
      });

      render(Component);

      expect(screen.getByText('Trang chủ')).toBeInTheDocument();
      expect(screen.getByText('PLC Programming')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Ladder Logic' })).toBeInTheDocument();
    });
  });
});
