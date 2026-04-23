/**
 * Tag Page Route
 * Display posts filtered by tag with pagination
 * Validates Requirements: 12.3
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { contentRepository } from '@/lib/data/factory';
import { TagPageClient } from '@/features/tags/components/TagPageClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface TagPageProps {
  params: {
    tagSlug: string;
  };
  searchParams: {
    page?: string;
  };
}

/**
 * Generate metadata for tag page
 */
export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const tag = await contentRepository.getTagBySlug(params.tagSlug);
  
  if (!tag) {
    return {
      title: 'Tag không tìm thấy',
    };
  }
  
  return {
    title: `${tag.name} - Automation Blog`,
    description: `Xem tất cả ${tag.postCount} bài viết về ${tag.name}`,
  };
}

/**
 * Generate static params for all tags (SSG)
 */
export async function generateStaticParams() {
  const tags = await contentRepository.getTags();
  
  return tags.map((tag) => ({
    tagSlug: tag.slug,
  }));
}

/**
 * Tag Page Component
 * 
 * Displays:
 * - Tag name as page heading
 * - Post count subheading
 * - Paginated list of posts (20 per page)
 * - Breadcrumb navigation
 */
export default async function TagPage({
  params,
  searchParams,
}: TagPageProps) {
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 20;
  
  // Fetch tag and posts
  const [tag, postsResult] = await Promise.all([
    contentRepository.getTagBySlug(params.tagSlug),
    contentRepository.getPostsByTag(params.tagSlug, { page, limit }),
  ]);
  
  // Handle 404
  if (!tag) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link
              href="/"
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Trang chủ
            </Link>
          </li>
          <li>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </li>
          <li>
            <span className="text-foreground font-medium">Tags</span>
          </li>
          <li>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </li>
          <li>
            <span className="text-foreground font-medium">{tag.name}</span>
          </li>
        </ol>
      </nav>
      
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {tag.name}
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              {postsResult.pagination.total} bài viết
            </p>
          </div>
        </div>
      </div>
      
      {/* Post List */}
      <TagPageClient
        tagSlug={params.tagSlug}
        posts={postsResult.data}
        pagination={{
          page: postsResult.pagination.page,
          totalPages: postsResult.pagination.totalPages,
          total: postsResult.pagination.total,
        }}
      />
    </div>
  );
}
