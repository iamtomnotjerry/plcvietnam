import type { NavigationNode } from '@/lib/types/domain';

/**
 * Recursively filter navigation nodes by label (case-insensitive).
 * Keeps a parent if its label matches or any descendant matches.
 */
export function filterNavigationTreeByQuery(
  tree: NavigationNode[],
  rawQuery: string
): NavigationNode[] {
  const query = rawQuery.toLowerCase().trim();
  if (!query) return tree;

  function filterNode(node: NavigationNode): NavigationNode | null {
    const labelMatches = node.label.toLowerCase().includes(query);

    const filteredChildren = node.children
      ?.map((child) => filterNode(child))
      .filter((child): child is NavigationNode => child !== null);

    if (labelMatches || (filteredChildren && filteredChildren.length > 0)) {
      return {
        ...node,
        children: filteredChildren,
      };
    }

    return null;
  }

  return tree
    .map((node) => filterNode(node))
    .filter((node): node is NavigationNode => node !== null);
}
