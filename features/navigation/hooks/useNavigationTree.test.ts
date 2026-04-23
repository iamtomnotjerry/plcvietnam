/**
 * Unit tests for useNavigationTree hook
 * Validates Requirements: 1.1, 1.5
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNavigationTree } from './useNavigationTree';
import type { NavigationNode } from '@/lib/types/domain';
import { getRepository } from '@/lib/data/factory';

// Mock the repository factory
vi.mock('@/lib/data/factory', () => ({
  getRepository: vi.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Sample navigation tree data
const mockNavigationTree: NavigationNode[] = [
  {
    id: 'field-1',
    type: 'field',
    label: 'PLC',
    slug: 'plc',
    url: '/fields/plc',
    postCount: 10,
    children: [
      {
        id: 'category-1',
        type: 'category',
        label: 'Basics',
        slug: 'basics',
        url: '/fields/plc/basics',
        postCount: 5,
        children: [
          {
            id: 'post-1',
            type: 'post',
            label: 'Introduction to PLC',
            slug: 'intro-plc',
            url: '/fields/plc/basics/intro-plc',
          },
        ],
      },
    ],
  },
  {
    id: 'field-2',
    type: 'field',
    label: 'SCADA',
    slug: 'scada',
    url: '/fields/scada',
    postCount: 8,
    children: [],
  },
];

describe('useNavigationTree', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock repository
    vi.mocked(getRepository).mockReturnValue({
      getNavigationTree: vi.fn().mockResolvedValue(mockNavigationTree),
    } as any);
  });
  
  it('should fetch navigation tree on mount', async () => {
    const { result } = renderHook(() => useNavigationTree());
    
    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.tree).toEqual([]);
    
    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.tree).toEqual(mockNavigationTree);
    expect(result.current.error).toBeNull();
  });
  
  it('should initialize with empty expanded state', async () => {
    const { result } = renderHook(() => useNavigationTree());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.expandedIds.size).toBe(0);
  });
  
  it('should initialize with provided initial expanded IDs', async () => {
    const initialExpanded = ['field-1', 'category-1'];
    const { result } = renderHook(() => useNavigationTree(initialExpanded));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.expandedIds.has('field-1')).toBe(true);
    expect(result.current.expandedIds.has('category-1')).toBe(true);
    expect(result.current.expandedIds.size).toBe(2);
  });
  
  it('should toggle node expansion state', async () => {
    const { result } = renderHook(() => useNavigationTree());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Toggle to expand
    act(() => {
      result.current.toggleNode('field-1');
    });
    
    expect(result.current.expandedIds.has('field-1')).toBe(true);
    
    // Toggle to collapse
    act(() => {
      result.current.toggleNode('field-1');
    });
    
    expect(result.current.expandedIds.has('field-1')).toBe(false);
  });
  
  it('should expand a specific node', async () => {
    const { result } = renderHook(() => useNavigationTree());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    act(() => {
      result.current.expandNode('field-1');
    });
    
    expect(result.current.expandedIds.has('field-1')).toBe(true);
    
    // Expanding again should not change state
    act(() => {
      result.current.expandNode('field-1');
    });
    
    expect(result.current.expandedIds.has('field-1')).toBe(true);
  });
  
  it('should collapse a specific node', async () => {
    const { result } = renderHook(() => useNavigationTree(['field-1']));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.expandedIds.has('field-1')).toBe(true);
    
    act(() => {
      result.current.collapseNode('field-1');
    });
    
    expect(result.current.expandedIds.has('field-1')).toBe(false);
  });
  
  it('should expand all nodes', async () => {
    const { result } = renderHook(() => useNavigationTree());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    act(() => {
      result.current.expandAll();
    });
    
    // Should expand all nodes in the tree
    expect(result.current.expandedIds.has('field-1')).toBe(true);
    expect(result.current.expandedIds.has('field-2')).toBe(true);
    expect(result.current.expandedIds.has('category-1')).toBe(true);
    expect(result.current.expandedIds.has('post-1')).toBe(true);
    expect(result.current.expandedIds.size).toBe(4);
  });
  
  it('should collapse all nodes', async () => {
    const { result } = renderHook(() => useNavigationTree(['field-1', 'category-1']));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.expandedIds.size).toBe(2);
    
    act(() => {
      result.current.collapseAll();
    });
    
    expect(result.current.expandedIds.size).toBe(0);
  });
  
  it('should persist expansion state to localStorage', async () => {
    const { result } = renderHook(() => useNavigationTree());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    act(() => {
      result.current.expandNode('field-1');
      result.current.expandNode('category-1');
    });
    
    // Check localStorage
    const stored = localStorageMock.getItem('navigation-tree-expanded');
    expect(stored).toBeTruthy();
    
    const parsed = JSON.parse(stored!);
    expect(parsed).toContain('field-1');
    expect(parsed).toContain('category-1');
  });
  
  it('should load expansion state from localStorage', async () => {
    // Pre-populate localStorage
    localStorageMock.setItem(
      'navigation-tree-expanded',
      JSON.stringify(['field-2', 'category-1'])
    );
    
    const { result } = renderHook(() => useNavigationTree());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Should load from localStorage
    expect(result.current.expandedIds.has('field-2')).toBe(true);
    expect(result.current.expandedIds.has('category-1')).toBe(true);
    expect(result.current.expandedIds.size).toBe(2);
  });
  
  it('should handle fetch errors gracefully', async () => {
    const mockError = new Error('Network error');
    vi.mocked(getRepository).mockReturnValue({
      getNavigationTree: vi.fn().mockRejectedValue(mockError),
    } as any);
    
    const { result } = renderHook(() => useNavigationTree());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.error).toEqual(mockError);
    expect(result.current.tree).toEqual([]);
  });
  
  it('should handle invalid localStorage data gracefully', async () => {
    // Set invalid JSON in localStorage
    localStorageMock.setItem('navigation-tree-expanded', 'invalid-json');
    
    const { result } = renderHook(() => useNavigationTree());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Should initialize with empty state instead of crashing
    expect(result.current.expandedIds.size).toBe(0);
  });
  
  it('should handle non-array localStorage data gracefully', async () => {
    // Set non-array data in localStorage
    localStorageMock.setItem('navigation-tree-expanded', JSON.stringify({ invalid: 'data' }));
    
    const { result } = renderHook(() => useNavigationTree());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Should initialize with empty state
    expect(result.current.expandedIds.size).toBe(0);
  });
});
