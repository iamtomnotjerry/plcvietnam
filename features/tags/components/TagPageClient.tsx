/**
 * Tag Page Client Component
 * Client-side wrapper for tag page with pagination
 * Validates Requirements: 12.3
 */

'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { PostList } from '@/features/posts/components/PostList';
import type { Post } from '@/lib/types/domain';

export interface TagPageClientProps {
  tagSlug: string;
  posts: Post[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

/**
 * Client-side component for tag page
 * Handles pagination with Next.js router
 */
export function TagPageClient({
  tagSlug,
  posts,
  pagination,
}: TagPageClientProps) {
  const router = useRouter();
  
  const handlePageChange = (newPage: number) => {
    router.push(`/tags/${tagSlug}?page=${newPage}` as Route);
  };
  
  return (
    <PostList
      posts={posts}
      pagination={{
        page: pagination.page,
        totalPages: pagination.totalPages,
        onPageChange: handlePageChange,
      }}
      showCategory={true}
      showThumbnail={true}
    />
  );
}
