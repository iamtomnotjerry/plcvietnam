/**
 * Loading UI for auth pages
 * Displays skeleton while auth pages are loading
 */

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="animate-pulse space-y-6">
          {/* Logo/Title skeleton */}
          <div className="text-center space-y-2">
            <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>

          {/* Form skeleton */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-primary/20 rounded"></div>
          </div>

          {/* Footer links skeleton */}
          <div className="text-center">
            <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
