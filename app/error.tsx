'use client';

/**
 * Custom 500 Error Page
 * Validates Requirements: 18.3, 18.4, 18.5
 */

import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <p className="text-8xl font-bold text-destructive">500</p>
          <h1 className="text-2xl font-semibold text-foreground">
            Đã xảy ra lỗi
          </h1>
          <p className="text-muted-foreground">
            {error.message || 'Máy chủ gặp sự cố. Vui lòng thử lại sau.'}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">Mã lỗi: {error.digest}</p>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-border bg-background text-foreground font-medium hover:bg-muted transition-colors cursor-pointer"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
