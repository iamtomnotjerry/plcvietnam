'use client';

import { CommentSection } from './CommentSection';
import { useComments } from '../hooks/useComments';

export interface PostCommentsProps {
  postId: string;
  postSlug: string;
}

export function PostComments({ postId, postSlug }: PostCommentsProps) {
  const { comments, isLoading, error, submitComment } = useComments(postId);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error.message}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 py-8" aria-busy="true">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <CommentSection
      postId={postId}
      postSlug={postSlug}
      comments={comments}
      onSubmit={submitComment}
    />
  );
}
