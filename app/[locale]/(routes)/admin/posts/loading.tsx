/**
 * Shown while the posts list RSC payload is loading (filters, pagination, search).
 */

export default function AdminPostsLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <div className="animate-pulse space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-md bg-muted" />
            <div className="h-4 max-w-md rounded-md bg-muted" />
          </div>
          <div className="h-10 w-40 rounded-md bg-muted" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-28 rounded-full bg-muted" />
          ))}
        </div>
        <div className="space-y-2 rounded-lg border border-border bg-card p-4">
          <div className="h-10 rounded-md bg-muted" />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 rounded-md bg-muted/80" />
          ))}
        </div>
      </div>
    </div>
  );
}
