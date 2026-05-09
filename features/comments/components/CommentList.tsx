'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Comment } from '@/lib/types/domain';
import { CommentForm } from './CommentForm';

interface CommentListProps {
  comments: Comment[];
  onReply: (content: string, parentId?: string | null) => Promise<void>;
  isAuthenticated: boolean;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

interface CommentItemProps {
  comment: Comment;
  onReply: (content: string, parentId?: string | null) => Promise<void>;
  isAuthenticated: boolean;
  depth?: number;
}

function CommentItem({ comment, onReply, isAuthenticated, depth = 0 }: CommentItemProps) {
  const t = useTranslations('comments');
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleReplySubmit = async (content: string) => {
    await onReply(content, comment.id);
    setShowReplyForm(false);
  };

  const isOptimistic = comment.id.startsWith('optimistic-');

  return (
    <li className={`flex flex-col gap-3 ${isOptimistic ? 'opacity-60' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {comment.userAvatar ? (
            <Image
              src={comment.userAvatar}
              alt={comment.userName}
              width={depth === 0 ? 36 : 28}
              height={depth === 0 ? 36 : 28}
              className="rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div
              className={`rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold ${
                depth === 0 ? 'w-9 h-9 text-sm' : 'w-7 h-7 text-xs'
              }`}
              aria-hidden="true"
            >
              {(comment.userName || '?').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Bubble */}
        <div className="flex-1 min-w-0">
          <div
            className={`rounded-lg border border-border bg-card px-4 py-3 ${
              depth > 0 ? 'bg-muted/30' : ''
            }`}
          >
            <div className="flex items-baseline gap-2 flex-wrap mb-1">
              <span className="text-sm font-semibold text-card-foreground">
                {comment.userName || t('anonymous')}
              </span>
              <time
                dateTime={new Date(comment.createdAt).toISOString()}
                className="text-xs text-muted-foreground"
              >
                {formatDate(new Date(comment.createdAt))}
              </time>
              {isOptimistic && (
                <span className="text-xs text-muted-foreground italic">
                  {t('optimisticSending')}
                </span>
              )}
            </div>
            <p className="text-sm text-card-foreground whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          {/* Reply button */}
          {isAuthenticated && !isOptimistic && depth < 2 && (
            <button
              onClick={() => setShowReplyForm((v) => !v)}
              className="mt-1.5 ml-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              {showReplyForm ? t('cancel') : t('reply')}
            </button>
          )}

          {/* Inline reply form */}
          {showReplyForm && (
            <div className="mt-3 pl-1">
              <CommentForm
                onSubmit={handleReplySubmit}
                placeholder={t('replyPlaceholder', { name: comment.userName || t('anonymous') })}
                submitLabel={t('replySubmit')}
                compact
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <ul
          className={`flex flex-col gap-3 pl-10 border-l-2 border-border/50 ml-4`}
          aria-label={t('repliesAriaLabel')}
        >
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              isAuthenticated={isAuthenticated}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function CommentList({ comments, onReply, isAuthenticated }: CommentListProps) {
  const t = useTranslations('comments');

  if (comments.length === 0) {
    return <div className="py-8 text-center text-muted-foreground text-sm">{t('emptyList')}</div>;
  }

  // Sort top-level ascending
  const sorted = [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <ul className="flex flex-col gap-5" aria-label={t('listAriaLabel')}>
      {sorted.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          isAuthenticated={isAuthenticated}
          depth={0}
        />
      ))}
    </ul>
  );
}
