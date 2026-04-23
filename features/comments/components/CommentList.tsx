/**
 * CommentList Component
 * Displays a list of comments in ascending date order
 * Validates Requirements: 4.1, 4.8
 */

import Image from 'next/image';
import type { Comment } from '@/lib/types/domain';

interface CommentListProps {
  comments: Comment[];
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
      </div>
    );
  }

  // Sort ascending by createdAt
  const sorted = [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <ul className="flex flex-col gap-4" aria-label="Danh sách bình luận">
      {sorted.map((comment) => (
        <li
          key={comment.id}
          className="flex gap-3 rounded-lg border border-border bg-card p-4"
        >
          {/* Avatar */}
          <div className="shrink-0">
            {comment.userAvatar ? (
              <Image
                src={comment.userAvatar}
                alt={comment.userName}
                width={36}
                height={36}
                className="rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm"
                aria-hidden="true"
              >
                {comment.userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-sm font-semibold text-card-foreground">
                {comment.userName}
              </span>
              <time
                dateTime={new Date(comment.createdAt).toISOString()}
                className="text-xs text-muted-foreground"
              >
                {formatDate(new Date(comment.createdAt))}
              </time>
            </div>
            <p className="mt-1 text-sm text-card-foreground whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
