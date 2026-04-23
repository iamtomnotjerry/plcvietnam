/**
 * CommentForm Component
 * Form for submitting comments with validation
 * Validates Requirements: 4.1, 4.5, 4.6, 4.7, 4.8
 */

'use client';

import { useState } from 'react';
import { validateComment } from '../utils/validation';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
}

export function CommentForm({ onSubmit }: CommentFormProps) {
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
    // Clear error on change
    if (error) {
      setError(undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="comment-input" className="text-sm font-medium text-card-foreground">
          Bình luận của bạn
        </label>
        <textarea
          id="comment-input"
          value={content}
          onChange={handleChange}
          disabled={isSubmitting}
          rows={4}
          placeholder="Nhập bình luận..."
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

      <div className="mt-3 flex items-center justify-end">
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
          aria-label={isSubmitting ? 'Đang gửi bình luận...' : 'Gửi bình luận'}
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
          {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
        </button>
      </div>
    </form>
  );
}
