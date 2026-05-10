/**
 * Navigation Tree Hook
 * Consumes shared navigation data from NavigationTreeDataProvider; expansion + localStorage
 * Validates Requirements: 1.1, 1.5
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NavigationNode } from '@/lib/types/domain';
import { useNavigationTreeData } from '../components/NavigationTreeDataProvider';

const STORAGE_KEY = 'navigation-tree-expanded';

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

function saveExpandedState(expandedIds: string[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedIds));
  } catch (error) {
    console.error('Failed to save navigation expansion state:', error);
  }
}

interface UseNavigationTreeReturn {
  tree: NavigationNode[];
  expandedIds: Set<string>;
  toggleNode: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * @param initialExpanded - Optional array of initially expanded node IDs
 */
export function useNavigationTree(initialExpanded?: string[]): UseNavigationTreeReturn {
  const { tree, isLoading, error, refresh } = useNavigationTreeData();

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const stored = loadExpandedState();
    return new Set(initialExpanded || stored);
  });

  useEffect(() => {
    saveExpandedState(Array.from(expandedIds));
  }, [expandedIds]);

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

  const expandNode = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(nodeId);
      return next;
    });
  }, []);

  const collapseNode = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(nodeId);
      return next;
    });
  }, []);

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
    refresh,
  };
}
