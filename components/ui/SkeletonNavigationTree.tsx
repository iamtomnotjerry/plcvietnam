/**
 * SkeletonNavigationTree Component
 * Placeholder matching NavigationTree shape while data is loading
 * Validates Requirements: 17.1
 */

/**
 * SkeletonNavigationTree
 *
 * Displays animated pulse placeholders that mirror the NavigationTree layout:
 * - Several tree node rows at varying indent levels
 *
 * Requirement 17.1: Skeleton_UI placeholders for the Navigation_Tree while data is fetched
 */
export function SkeletonNavigationTree() {
  return (
    <div
      className="w-full p-2"
      aria-hidden="true"
      data-testid="skeleton-navigation-tree"
    >
      <div className="space-y-1">
        {/* Field node */}
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-4 h-4 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-32" />
        </div>

        {/* Category node (indented) */}
        <div className="flex items-center gap-2 px-2 py-2 ml-4">
          <div className="w-4 h-4 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-24" />
        </div>

        {/* Post node (double indented) */}
        <div className="flex items-center gap-2 px-2 py-2 ml-8">
          <div className="h-4 bg-muted animate-pulse rounded w-40" />
        </div>

        {/* Post node */}
        <div className="flex items-center gap-2 px-2 py-2 ml-8">
          <div className="h-4 bg-muted animate-pulse rounded w-36" />
        </div>

        {/* Category node */}
        <div className="flex items-center gap-2 px-2 py-2 ml-4">
          <div className="w-4 h-4 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-28" />
        </div>

        {/* Field node */}
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-4 h-4 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-36" />
        </div>

        {/* Category node */}
        <div className="flex items-center gap-2 px-2 py-2 ml-4">
          <div className="w-4 h-4 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-20" />
        </div>

        {/* Field node */}
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-4 h-4 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-28" />
        </div>
      </div>
    </div>
  );
}
