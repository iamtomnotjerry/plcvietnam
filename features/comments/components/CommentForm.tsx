'use client';

import { useState } from 'react';
import { validateComment } from '../utils/validation';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  submitLabel?: string;
  compact?: boolean;
}

export function CommentForm({
  onSubmit,
  placeholder = 'Nhập bình luận...',
  submitLabel = 'Gửi bình luận',
  compact = false,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateComment(content);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(undefined);
    setIsSubmitting(true);

    try {
      await onSubmit(content);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (error) setError(undefined);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-2">
        {!compact && (
          <label htmlFor="comment-input" className="text-sm font-medium text-card-foreground">
            Bình luận của bạn
          </label>
        )}
        <textarea
          id={compact ? undefined : 'comment-input'}
          value={content}
          onChange={handleChange}
          disabled={isSubmitting}
          rows={compact ? 2 : 4}
          placeholder={placeholder}
          aria-describedby={error ? 'comment-error' : undefined}
          aria-invalid={!!error}
          className={`
            w-full rounded-lg border px-3 py-2
            text-sm text-card-foreground
            bg-background placeholder:text-muted-foreground
            resize-y
            focus:outline-none focus:ring-2 focus:ring-primary/50
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            ${error ? 'border-destructive focus:ring-destructive/50' : 'border-border'}
          `}
        />
        {error && (
          <p id="comment-error" role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <div className="mt-2 flex items-center justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            inline-flex items-center gap-2
            px-4 py-2
            bg-primary text-primary-foreground
            rounded-lg text-sm font-medium
            hover:bg-primary/90
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
            cursor-pointer
          "
          aria-label={isSubmitting ? 'Đang gửi...' : submitLabel}
        >
          {isSubmitting && (
            <svg
              className="w-4 h-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {isSubmitting ? 'Đang gửi...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
