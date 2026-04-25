/**
 * Feature Error Boundary
 * Wraps individual features with error handling
 */

'use client';

import { ErrorBoundary } from './ErrorBoundary';

interface FeatureErrorBoundaryProps {
  children: React.ReactNode;
  feature: string;
}

export function FeatureErrorBoundary({ children, feature }: FeatureErrorBoundaryProps) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to error tracking service (e.g., Sentry)
        console.error(`Error in ${feature} feature:`, error, errorInfo);

        // TODO: Send to error tracking service
        // if (typeof window !== 'undefined' && window.Sentry) {
        //   window.Sentry.captureException(error, {
        //     contexts: {
        //       feature: { name: feature },
        //       errorInfo,
        //     },
        //   });
        // }
      }}
      fallback={
        <div className="min-h-[200px] flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-muted-foreground mb-2">Không thể tải {feature}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-primary hover:underline"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
