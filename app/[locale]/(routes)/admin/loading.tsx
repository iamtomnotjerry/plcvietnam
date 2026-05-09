/**
 * Loading UI for admin pages
 * Displays skeleton while admin pages are loading
 */

export default function AdminLoading() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>

          {/* Form/Table skeleton */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>

            {/* Table rows skeleton */}
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
