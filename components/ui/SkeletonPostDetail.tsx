/**
 * SkeletonPostDetail Component
 * Placeholder matching PostDetail shape while data is loading
 * Validates Requirements: 17.1
 */

/**
 * SkeletonPostDetail
 *
 * Displays an animated pulse placeholder that mirrors the PostDetail layout:
 * - Breadcrumb row
 * - Large title bar
 * - Metadata row (author, date, reading time, views)
 * - Content lines (multiple paragraphs)
 *
 * Requirement 17.1: Skeleton_UI placeholders for Post detail content while data is fetched
 */
export function SkeletonPostDetail() {
  return (
    <div
      className="w-full"
      aria-hidden="true"
      data-testid="skeleton-post-detail"
    >
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </div>

      {/* Title - large, 2 lines */}
      <div className="mb-4 space-y-3">
        <div className="h-10 bg-muted animate-pulse rounded w-full" />
        <div className="h-10 bg-muted animate-pulse rounded w-3/4" />
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        {/* Author avatar + name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
        {/* Date */}
        <div className="h-4 w-28 bg-muted animate-pulse rounded" />
        {/* Reading time */}
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        {/* View count */}
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </div>

      {/* Content lines */}
      <div className="space-y-3">
        {/* Paragraph 1 */}
        <div className="h-4 bg-muted animate-pulse rounded w-full" />
        <div className="h-4 bg-muted animate-pulse rounded w-full" />
        <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
        <div className="h-4 bg-muted animate-pulse rounded w-full" />
        <div className="h-4 bg-muted animate-pulse rounded w-4/5" />

        {/* Heading placeholder */}
        <div className="h-7 bg-muted animate-pulse rounded w-2/5 mt-6" />

        {/* Paragraph 2 */}
        <div className="h-4 bg-muted animate-pulse rounded w-full" />
        <div className="h-4 bg-muted animate-pulse rounded w-full" />
        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        <div className="h-4 bg-muted animate-pulse rounded w-full" />

        {/* Heading placeholder */}
        <div className="h-7 bg-muted animate-pulse rounded w-1/3 mt-6" />

        {/* Paragraph 3 */}
        <div className="h-4 bg-muted animate-pulse rounded w-full" />
        <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
        <div className="h-4 bg-muted animate-pulse rounded w-full" />
        <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
      </div>
    </div>
  );
}
