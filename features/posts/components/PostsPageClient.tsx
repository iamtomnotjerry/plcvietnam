'use client';

import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { PostList } from './PostList';
import type { Post } from '@/lib/types/domain';

export interface PostsPageClientProps {
  posts: Post[];
  pagination: {
    page: number;
    totalPages: number;
  };
}

export function PostsPageClient({ posts, pagination }: PostsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', String(newPage));
    }
    const q = params.toString();
    router.push((q ? `/posts?${q}` : '/posts') as Route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PostList
      posts={posts}
      showTags
      showThumbnail
      variant="compact"
      pagination={{
        page: pagination.page,
        totalPages: pagination.totalPages,
        onPageChange: handlePageChange,
      }}
    />
  );
}
