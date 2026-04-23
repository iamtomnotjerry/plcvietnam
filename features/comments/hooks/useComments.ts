/**
 * useComments Hook
 * Fetches and submits comments with optimistic updates
 * Validates Requirements: 4.5, 4.8
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Comment } from '@/lib/types/domain';

function reviveComments(data: unknown): Comment[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const c = item as Record<string, string | undefined>;
    return {
      id: String(c.id),
      postId: String(c.postId),
      userId: String(c.userId),
      userName: String(c.userName),
      userAvatar: c.userAvatar,
      content: String(c.content),
      createdAt: new Date(String(c.createdAt)),
      updatedAt: new Date(String(c.updatedAt ?? c.createdAt)),
    };
  });
}

/**
 * Hook return type
 */
export interface UseCommentsReturn {
  /** List of comments for the post */
  comments: Comment[];
  /** Whether comments are being fetched */
  isLoading: boolean;
  /** Error from fetching comments, if any */
  error: Error | null;
  /** Submit a new comment */
  submitComment: (content: string) => Promise<void>;
  /** Whether a comment submission is in progress */
  isSubmitting: boolean;
}

/**
 * Custom hook for fetching and submitting comments with optimistic updates.
 *
 * Behavior:
 * - Loads comments for the given postId on mount
 * - submitComment optimistically adds the comment to the list immediately
 * - On success, replaces the optimistic comment with the real one from the API
 * - On error, rolls back the optimistic comment and re-throws the error
 *
 * @param postId - The ID of the post to load/submit comments for
 */
export function useComments(postId: string): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load comments on mount (and when postId changes)
  useEffect(() => {
    let isMounted = true;

    const fetchComments = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`/api/comments?postId=${encodeURIComponent(postId)}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? 'Không thể tải bình luận');
        }
        const json = await res.json();
        const result = reviveComments(json);

        if (isMounted) {
          setComments(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Không thể tải bình luận'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchComments();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  /**
   * Submit a new comment with optimistic update.
   *
   * Steps:
   * 1. Create a temporary optimistic comment and add it to the list immediately
   * 2. POST to /api/comments with { postId, content }
   * 3. On success, replace the optimistic comment with the real one
   * 4. On error, roll back the optimistic comment and re-throw
   */
  const submitComment = useCallback(
    async (content: string) => {
      // Build a temporary optimistic comment
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticComment: Comment = {
        id: optimisticId,
        postId,
        userId: 'optimistic',
        userName: '',
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Optimistically add to list
      setComments(prev => [...prev, optimisticComment]);
      setIsSubmitting(true);

      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, content }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? 'Không thể gửi bình luận');
        }

        const raw = await response.json();
        const realComment = reviveComments([raw])[0];

        // Replace optimistic comment with real one
        setComments(prev =>
          prev.map(c => (c.id === optimisticId ? realComment : c))
        );
      } catch (err) {
        // Roll back optimistic comment
        setComments(prev => prev.filter(c => c.id !== optimisticId));
        throw err instanceof Error ? err : new Error('Không thể gửi bình luận');
      } finally {
        setIsSubmitting(false);
      }
    },
    [postId]
  );

  return {
    comments,
    isLoading,
    error,
    submitComment,
    isSubmitting,
  };
}
