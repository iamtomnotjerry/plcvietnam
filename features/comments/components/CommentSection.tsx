/**
 * CommentSection Component
 * Main container for comments - handles auth state and composes sub-components
 * Validates Requirements: 4.1, 4.2, 4.4, 4.8
 */

'use client';

import { useSession } from 'next-auth/react';
import { SignInButton } from './SignInButton';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import type { Comment } from '@/lib/types/domain';

interface CommentSectionProps {
  postId: string;
  postSlug: string;
  comments: Comment[];
  onSubmit: (content: string) => Promise<void>;
}

export function CommentSection({ postId: _postId, postSlug: _postSlug, comments, onSubmit }: CommentSectionProps) {
  const { status } = useSession();

  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-6">
      <h2 id="comments-heading" className="text-xl font-semibold text-card-foreground">
        Bình luận ({comments.length})
      </h2>

      {/* Auth area */}
      <div>
        {status === 'unauthenticated' && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Đăng nhập để để lại bình luận.
            </p>
            <SignInButton />
          </div>
        )}

        {status === 'loading' && (
          <div className="animate-pulse rounded-lg border border-border bg-muted/30 p-4 h-16" aria-label="Đang tải..." />
        )}

        {status === 'authenticated' && (
          <div className="flex flex-col gap-3">
            <SignInButton />
            <CommentForm onSubmit={onSubmit} />
          </div>
        )}
      </div>

      {/* Comment list */}
      <CommentList comments={comments} />
    </section>
  );
}
