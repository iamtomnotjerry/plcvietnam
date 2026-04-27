/**
 * CommentSection Component
 * Main container for comments - handles auth state and composes sub-components
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
  onSubmit: (content: string, parentId?: string | null) => Promise<void>;
}

export function CommentSection({
  postId: _postId,
  postSlug: _postSlug,
  comments,
  onSubmit,
}: CommentSectionProps) {
  const { status } = useSession();

  // Count total including replies
  const countAll = (list: Comment[]): number =>
    list.reduce((acc, c) => acc + 1 + countAll(c.replies ?? []), 0);
  const total = countAll(comments);

  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-6">
      <h2 id="comments-heading" className="text-xl font-semibold text-card-foreground">
        Bình luận ({total})
      </h2>

      {/* Auth area — top-level comment form */}
      <div>
        {status === 'unauthenticated' && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Đăng nhập để để lại bình luận.</p>
            <SignInButton />
          </div>
        )}

        {status === 'loading' && (
          <div
            className="animate-pulse rounded-lg border border-border bg-muted/30 p-4 h-16"
            aria-label="Đang tải..."
          />
        )}

        {status === 'authenticated' && (
          <div className="flex flex-col gap-3">
            <SignInButton />
            <CommentForm onSubmit={(content) => onSubmit(content, null)} />
          </div>
        )}
      </div>

      {/* Comment list with nested replies */}
      <CommentList
        comments={comments}
        onReply={onSubmit}
        isAuthenticated={status === 'authenticated'}
      />
    </section>
  );
}
