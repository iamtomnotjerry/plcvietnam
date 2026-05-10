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
  const row = (indent: string, key: string) => (
    <div
      key={key}
      className={`flex items-center gap-2 rounded-lg border border-transparent px-2 py-2.5 ${indent}`}
    >
      <div className="h-4 w-4 shrink-0 animate-pulse rounded-md bg-muted/90" />
      <div className="h-3.5 max-w-[min(100%,14rem)] flex-1 animate-pulse rounded-md bg-muted/80" />
    </div>
  );

  return (
    <div className="w-full p-1" aria-hidden="true" data-testid="skeleton-navigation-tree">
      <div className="space-y-0.5">
        {row('', 'sk-1')}
        {row('ml-3', 'sk-2')}
        {row('ml-6', 'sk-3')}
        {row('ml-6', 'sk-4')}
        {row('ml-3', 'sk-5')}
        {row('', 'sk-6')}
        {row('ml-3', 'sk-7')}
        {row('', 'sk-8')}
      </div>
    </div>
  );
}
