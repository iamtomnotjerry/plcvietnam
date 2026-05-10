/**
 * SkeletonPostCard Component
 * Placeholder matching PostCard shape while data is loading
 * Validates Requirements: 17.1, 17.2
 */

/**
 * SkeletonPostCard
 *
 * Displays an animated pulse placeholder that mirrors the PostCard layout:
 * - Tag row (pills)
 * - Title bar (2 lines)
 * - Excerpt lines (3 lines)
 * - Metadata row (date + reading time)
 *
 * Requirement 17.1: Skeleton_UI placeholders for Post lists while data is fetched
 * Requirement 17.2: Skeleton matching shape of a Post card
 */
export function SkeletonPostCard() {
  return (
    <div
      className="block h-full bg-card border border-border rounded-lg overflow-hidden"
      aria-hidden="true"
      data-testid="skeleton-post-card"
    >
      {/* Thumbnail placeholder */}
      <div className="w-full h-[200px] bg-muted animate-pulse" />

      {/* Content */}
      <div className="p-5">
        {/* Tag pills placeholder */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <div className="h-5 w-14 bg-muted animate-pulse rounded-full" />
          <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
          <div className="h-5 w-12 bg-muted animate-pulse rounded-full" />
        </div>

        {/* Title - 2 lines */}
        <div className="mb-2 space-y-2">
          <div className="h-5 bg-muted animate-pulse rounded w-full" />
          <div className="h-5 bg-muted animate-pulse rounded w-4/5" />
        </div>

        {/* Excerpt - 3 lines */}
        <div className="mb-4 space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded w-full" />
          <div className="h-4 bg-muted animate-pulse rounded w-full" />
          <div className="h-4 bg-muted animate-pulse rounded w-3/5" />
        </div>

        {/* Metadata row: date + reading time */}
        <div className="flex items-center gap-4">
          <div className="h-4 w-28 bg-muted animate-pulse rounded" />
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
