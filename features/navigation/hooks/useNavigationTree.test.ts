import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useNavigationTree } from './useNavigationTree';
import type { NavigationNode } from '@/lib/types/domain';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
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
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const mockTree: NavigationNode[] = [
  {
    id: 'field-1',
    type: 'field',
    label: 'PLC',
    slug: 'plc',
    url: '/fields/plc',
    postCount: 10,
    children: [
      {
        id: 'cat-1',
        type: 'category',
        label: 'PLC Basics',
        slug: 'plc-basics',
        url: '/fields/plc/plc-basics',
        postCount: 5,
      },
    ],
  },
];

function jsonRes(data: unknown) {
  return Promise.resolve(
    new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

describe('useNavigationTree', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should fetch navigation tree on mount', async () => {
    mockFetch.mockReturnValue(jsonRes(mockTree));
    const { result } = renderHook(() => useNavigationTree());
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.tree).toHaveLength(1);
    expect(result.current.tree[0].label).toBe('PLC');
    // Check that fetch was called with navigation endpoint (with cache-busting timestamp)
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/navigation?t='));
  });

  it('should expand all nodes', async () => {
    mockFetch.mockReturnValue(jsonRes(mockTree));
    const { result } = renderHook(() => useNavigationTree());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.expandAll());
    expect(result.current.expandedIds.has('field-1')).toBe(true);
    expect(result.current.expandedIds.has('cat-1')).toBe(true);
  });

  it('should handle fetch errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useNavigationTree());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.tree).toHaveLength(0);
  });

  it('should toggle node expansion', async () => {
    mockFetch.mockReturnValue(jsonRes(mockTree));
    const { result } = renderHook(() => useNavigationTree());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.toggleNode('field-1'));
    expect(result.current.expandedIds.has('field-1')).toBe(true);
    act(() => result.current.toggleNode('field-1'));
    expect(result.current.expandedIds.has('field-1')).toBe(false);
  });

  it('should collapse all nodes', async () => {
    mockFetch.mockReturnValue(jsonRes(mockTree));
    const { result } = renderHook(() => useNavigationTree());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.expandAll());
    act(() => result.current.collapseAll());
    expect(result.current.expandedIds.size).toBe(0);
  });
});
