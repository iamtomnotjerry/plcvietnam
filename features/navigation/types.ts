/**
 * Navigation Feature Types
 * Validates Requirements: 1.1, 1.5
 */

import type { NavigationNode } from '@/lib/types/domain';

/**
 * Props for NavigationTree component
 * Requirement 1.1: Display hierarchical tree (Fields → Categories → Posts)
 * Requirement 1.5: Persist expansion state in localStorage
 */
export interface NavigationTreeProps {
  /**
   * Initially expanded node IDs
   * Used to restore expansion state from localStorage or set default expanded nodes
   */
  initialExpanded?: string[];
  
  /**
   * Callback when a node is clicked
   * Allows parent components to handle navigation or custom behavior
   */
  onNodeClick?: (node: NavigationNode) => void;
  
  /**
   * Show search input when there are more than 10 fields
   * Requirement 1.6: Search input for filtering when >10 fields
   */
  searchable?: boolean;
}

/**
 * Re-export NavigationNode from domain types for convenience
 * This allows consumers to import both types from the same module
 */
export type { NavigationNode };
