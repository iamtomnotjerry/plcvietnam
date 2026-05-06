/**
 * Navigation Tree Hook
 * Fetches and manages navigation tree data with localStorage persistence
 * Validates Requirements: 1.1, 1.5
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NavigationNode } from '@/lib/types/domain';
import { onNavigationRefresh } from '@/lib/events/navigation';

const STORAGE_KEY = 'navigation-tree-expanded';

/**
 * Load expanded node IDs from localStorage
 */
function loadExpandedState(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error('Failed to load navigation expansion state:', error);
  }

  return [];
}

/**
 * Save expanded node IDs to localStorage
 */
function saveExpandedState(expandedIds: string[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedIds));
  } catch (error) {
    console.error('Failed to save navigation expansion state:', error);
  }
}

/**
 * Hook return type
 */
interface UseNavigationTreeReturn {
  /**
   * Navigation tree data (Fields → Categories → Posts)
   */
  tree: NavigationNode[];

  /**
   * Set of currently expanded node IDs
   */
  expandedIds: Set<string>;

  /**
   * Toggle expansion state of a node
   */
  toggleNode: (nodeId: string) => void;

  /**
   * Expand a specific node
   */
  expandNode: (nodeId: string) => void;

  /**
   * Collapse a specific node
   */
  collapseNode: (nodeId: string) => void;

  /**
   * Expand all nodes
   */
  expandAll: () => void;

  /**
   * Collapse all nodes
   */
  collapseAll: () => void;

  /**
   * Loading state
   */
  isLoading: boolean;

  /**
   * Error state
   */
  error: Error | null;

  /**
   * Refresh navigation tree data
   */
  refresh: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage navigation tree
 *
 * Features:
 * - Fetches navigation tree from repository
 * - Manages expansion state with localStorage persistence
 * - Provides helper functions to toggle, expand, collapse nodes
 *
 * Requirement 1.1: Display hierarchical tree structure
 * Requirement 1.5: Persist expansion state in localStorage
 *
 * @param initialExpanded - Optional array of initially expanded node IDs
 * @returns Navigation tree data and expansion state management functions
 */
export function useNavigationTree(initialExpanded?: string[]): UseNavigationTreeReturn {
  const [tree, setTree] = useState<NavigationNode[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Initialize from localStorage or use provided initial state
    const stored = loadExpandedState();
    return new Set(initialExpanded || stored);
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch navigation tree
  const fetchTree = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/navigation');
      if (!res.ok) throw new Error('Failed to fetch navigation');
      const data: NavigationNode[] = await res.json();

      setTree(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch navigation tree'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch navigation tree on mount
  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // Listen for refresh events
  useEffect(() => {
    return onNavigationRefresh(() => {
      fetchTree();
    });
  }, [fetchTree]);

  // Persist expansion state to localStorage whenever it changes
  useEffect(() => {
    saveExpandedState(Array.from(expandedIds));
  }, [expandedIds]);

  /**
   * Toggle expansion state of a node
   */
  const toggleNode = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  /**
   * Expand a specific node
   */
  const expandNode = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(nodeId);
      return next;
    });
  }, []);

  /**
   * Collapse a specific node
   */
  const collapseNode = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(nodeId);
      return next;
    });
  }, []);

  /**
   * Expand all nodes in the tree
   */
  const expandAll = useCallback(() => {
    const allIds = new Set<string>();

    function collectIds(nodes: NavigationNode[]) {
      for (const node of nodes) {
        allIds.add(node.id);
        if (node.children) {
          collectIds(node.children);
        }
      }
    }

    collectIds(tree);
    setExpandedIds(allIds);
  }, [tree]);

  /**
   * Collapse all nodes in the tree
   */
  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  return {
    tree,
    expandedIds,
    toggleNode,
    expandNode,
    collapseNode,
    expandAll,
    collapseAll,
    isLoading,
    error,
    refresh: fetchTree,
  };
}
