/**
 * Tag Posts Hook
 * Fetch posts by tag with pagination
 * Validates Requirements: 12.1, 12.2
 */

'use client';

import { useState, useEffect } from 'react';
import { contentRepository } from '@/lib/data/factory';
import type { Post, Tag } from '@/lib/types/domain';
import type { PaginatedResult } from '@/lib/data/repository';

export interface UseTagPostsOptions {
  tagSlug: string;
  page?: number;
  limit?: number;
}

export interface UseTagPostsReturn {
  tag: Tag | null;
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch posts by tag with pagination
 * 
 * @param options - Tag slug and pagination options
 * @returns Tag data, posts, pagination info, loading state, and error
 * 
 * @example
 * ```typescript
 * const { tag, posts, pagination, isLoading } = useTagPosts({
 *   tagSlug: 'co-ban',
 *   page: 1,
 *   limit: 20
 * });
 * ```
 */
export function useTagPosts({
  tagSlug,
  page = 1,
  limit = 20,
}: UseTagPostsOptions): UseTagPostsReturn {
  const [tag, setTag] = useState<Tag | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch tag and posts in parallel
        const [tagData, postsData] = await Promise.all([
          contentRepository.getTagBySlug(tagSlug),
          contentRepository.getPostsByTag(tagSlug, { page, limit }),
        ]);
        
        if (!isMounted) return;
        
        setTag(tagData);
        setPosts(postsData.data);
        setPagination(postsData.pagination);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error('Failed to fetch tag posts'));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [tagSlug, page, limit]);
  
  return {
    tag,
    posts,
    pagination,
    isLoading,
    error,
  };
}
