/**
 * useComments Hook
 * Fetches and submits comments with optimistic updates
 * Validates Requirements: 4.5, 4.8
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { Comment } from '@/lib/types/domain';
import { subscribeToComments } from '@/lib/supabase/realtime';

function reviveComments(data: unknown): Comment[] {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const c = item as Record<string, unknown>;
    const comment: Comment = {
      id: String(c.id),
      postId: String(c.postId),
      parentId: c.parentId != null ? String(c.parentId) : null,
      userId: String(c.userId),
      userName: String(c.userName),
      userAvatar: c.userAvatar != null ? String(c.userAvatar) : undefined,
      content: String(c.content),
      createdAt: new Date(String(c.createdAt)),
      updatedAt: new Date(String(c.updatedAt ?? c.createdAt)),
    };
    // Recursively revive replies
    if (Array.isArray(c.replies)) {
      comment.replies = reviveComments(c.replies);
    }
    return comment;
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
  /** Submit a new comment or reply */
  submitComment: (content: string, parentId?: string | null) => Promise<void>;
  /** Whether a comment submission is in progress */
  isSubmitting: boolean;
}

// ── Tree helpers ──────────────────────────────────────────────────────────────

function addReplyOptimistic(comments: Comment[], parentId: string, reply: Comment): Comment[] {
  return comments.map((c) => {
    if (c.id === parentId) {
      return { ...c, replies: [...(c.replies ?? []), reply] };
    }
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: addReplyOptimistic(c.replies, parentId, reply) };
    }
    return c;
  });
}

function replaceComment(comments: Comment[], targetId: string, replacement: Comment): Comment[] {
  return comments.map((c) => {
    if (c.id === targetId) return replacement;
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: replaceComment(c.replies, targetId, replacement) };
    }
    return c;
  });
}

function removeComment(comments: Comment[], targetId: string): Comment[] {
  return comments
    .filter((c) => c.id !== targetId)
    .map((c) => {
      if (c.replies && c.replies.length > 0) {
        return { ...c, replies: removeComment(c.replies, targetId) };
      }
      return c;
    });
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
  const t = useTranslations('comments');
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
          throw new Error((body as { error?: string }).error ?? t('fetchCommentsFailed'));
        }
        const json = await res.json();
        const result = reviveComments(json);

        if (isMounted) {
          setComments(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(t('fetchCommentsFailed')));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchComments();

    // Subscribe to realtime comment approvals
    const unsubscribe = subscribeToComments(postId, (newComment) => {
      const mapped = reviveComments([
        {
          id: newComment.id,
          postId: newComment.post_id,
          userId: newComment.user_id,
          userName: newComment.author_name,
          userAvatar: newComment.author_avatar,
          content: newComment.content,
          createdAt: newComment.created_at,
          updatedAt: newComment.updated_at,
        },
      ])[0];
      setComments((prev) => {
        // Avoid duplicates
        if (prev.some((c) => c.id === mapped.id)) return prev;
        return [...prev, mapped];
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- next-intl `t` is not stable in tests; strings only depend on locale via messages
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
    async (content: string, parentId?: string | null) => {
      // Build a temporary optimistic comment
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticComment: Comment = {
        id: optimisticId,
        postId,
        parentId: parentId ?? null,
        userId: 'optimistic',
        userName: '',
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
        replies: [],
      };

      // Optimistically add to list
      setComments((prev) => {
        if (parentId) {
          // Add as reply to parent
          return addReplyOptimistic(prev, parentId, optimisticComment);
        }
        return [...prev, optimisticComment];
      });
      setIsSubmitting(true);

      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ post_id: postId, content, parent_id: parentId ?? undefined }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? t('submitCommentFailed'));
        }

        const raw = await response.json();
        const realComment = reviveComments([raw])[0];

        // Replace optimistic comment with real one
        setComments((prev) => replaceComment(prev, optimisticId, { ...realComment, replies: [] }));
      } catch (err) {
        // Roll back optimistic comment
        setComments((prev) => removeComment(prev, optimisticId));
        throw err instanceof Error ? err : new Error(t('submitCommentFailed'));
      } finally {
        setIsSubmitting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see useEffect above
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
