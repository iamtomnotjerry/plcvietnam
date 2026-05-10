'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { NavigationNode } from '@/lib/types/domain';
import { onNavigationRefresh } from '@/lib/events/navigation';

export interface NavigationTreeDataContextValue {
  tree: NavigationNode[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const NavigationTreeDataContext = createContext<NavigationTreeDataContextValue | null>(null);

export function NavigationTreeDataProvider({ children }: { children: ReactNode }) {
  const [tree, setTree] = useState<NavigationNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTree = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/navigation', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch navigation');
      const data: NavigationNode[] = await res.json();

      setTree(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch navigation tree'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  useEffect(() => {
    return onNavigationRefresh(() => {
      fetchTree();
    });
  }, [fetchTree]);

  const value = useMemo(
    () => ({
      tree,
      isLoading,
      error,
      refresh: fetchTree,
    }),
    [tree, isLoading, error, fetchTree]
  );

  return (
    <NavigationTreeDataContext.Provider value={value}>
      {children}
    </NavigationTreeDataContext.Provider>
  );
}

export function useNavigationTreeData(): NavigationTreeDataContextValue {
  const ctx = useContext(NavigationTreeDataContext);
  if (!ctx) {
    throw new Error('useNavigationTreeData must be used within NavigationTreeDataProvider');
  }
  return ctx;
}
