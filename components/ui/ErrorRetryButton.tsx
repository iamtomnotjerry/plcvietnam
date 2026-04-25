/**
 * Error Retry Button - Client Component
 * Used in error states to allow users to retry
 */

'use client';

interface ErrorRetryButtonProps {
  onRetry?: () => void;
}

export function ErrorRetryButton({ onRetry }: ErrorRetryButtonProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <button
      onClick={handleRetry}
      className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      Thử lại
    </button>
  );
}
