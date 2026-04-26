'use client';

import { useState, useEffect } from 'react';
import type { Post, Tag } from '@/lib/types/domain';

export interface UseTagPostsOptions {
  tagSlug: string;
  page?: number;
  limit?: number;
}

export interface UseTagPostsReturn {
  tag: Tag | null;
  posts: Post[];
  pagination: { page: number; limit: number; total: number; totalPages: number } | null;
  isLoading: boolean;
  error: Error | null;
}

export function useTagPosts({
  tagSlug,
  page = 1,
  limit = 20,
}: UseTagPostsOptions): UseTagPostsReturn {
  const [tag, setTag] = useState<Tag | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<UseTagPostsReturn['pagination']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/tags/${tagSlug}`).then((r) => r.json()),
      fetch(`/api/tags/${tagSlug}/posts?page=${page}&limit=${limit}`).then((r) => r.json()),
    ])
      .then(([tagData, postsData]) => {
        if (!mounted) return;
        setTag(tagData.error ? null : tagData);
        setPosts(postsData.data ?? []);
        setPagination(postsData.pagination ?? null);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err : new Error('Failed to fetch'));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [tagSlug, page, limit]);

  return { tag, posts, pagination, isLoading, error };
}
