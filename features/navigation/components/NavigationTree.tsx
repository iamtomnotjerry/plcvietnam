/**
 * NavigationTree Component
 * Main container for hierarchical navigation with search functionality
 * Validates Requirements: 1.6
 */

'use client';

import { useState, useMemo } from 'react';
import { useNavigationTree } from '../hooks/useNavigationTree';
import { NavigationNode } from './NavigationNode';
import type { NavigationTreeProps } from '../types';
import type { NavigationNode as NavigationNodeType } from '@/lib/types/domain';

/**
 * NavigationTree Component
 * 
 * Main container component that:
 * - Fetches navigation tree data using useNavigationTree hook
 * - Displays search input when there are more than 10 fields
 * - Filters tree nodes based on search query
 * - Renders NavigationNode components recursively
 * 
 * Requirement 1.6: Search input for >10 fields
 */
export function NavigationTree({
  initialExpanded,
  onNodeClick,
  searchable = true,
}: NavigationTreeProps) {
  const {
    tree,
    expandedIds,
    toggleNode,
    isLoading,
    error,
  } = useNavigationTree(initialExpanded);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  /**
   * Determine if search should be shown
   * Show search when there are more than 10 fields
   */
  const shouldShowSearch = searchable && tree.length > 10;
  
  /**
   * Filter tree nodes based on search query
   * Searches in field names, category names, and post titles
   */
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) {
      return tree;
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    /**
     * Recursively filter nodes and their children
     * A node matches if:
     * - Its label contains the query, OR
     * - Any of its children match
     */
    function filterNode(node: NavigationNodeType): NavigationNodeType | null {
      const labelMatches = node.label.toLowerCase().includes(query);
      
      // Filter children recursively
      const filteredChildren = node.children
        ?.map(child => filterNode(child))
        .filter((child): child is NavigationNodeType => child !== null);
      
      // Include node if label matches OR any children match
      if (labelMatches || (filteredChildren && filteredChildren.length > 0)) {
        return {
          ...node,
          children: filteredChildren,
        };
      }
      
      return null;
    }
    
    return tree
      .map(node => filterNode(node))
      .filter((node): node is NavigationNodeType => node !== null);
  }, [tree, searchQuery]);
  
  /**
   * Handle search input change
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  /**
   * Clear search query
   */
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="w-full p-4">
        <div className="space-y-2">
          {/* Search skeleton */}
          {shouldShowSearch && (
            <div className="h-10 bg-muted rounded-md animate-pulse mb-4" />
          )}
          
          {/* Tree skeleton */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-muted rounded-md animate-pulse"
              style={{ width: `${80 + Math.random() * 20}%` }}
            />
          ))}
        </div>
      </div>
    );
  }
  
  /**
   * Error state
   */
  if (error) {
    return (
      <div className="w-full p-4">
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">Không thể tải cây điều hướng</p>
          <p className="mt-1 text-xs">{error.message}</p>
        </div>
      </div>
    );
  }
  
  /**
   * Empty state
   */
  if (tree.length === 0) {
    return (
      <div className="w-full p-4">
        <p className="text-sm text-muted-foreground">
          Chưa có nội dung
        </p>
      </div>
    );
  }
  
  /**
   * No search results
   */
  if (searchQuery && filteredTree.length === 0) {
    return (
      <div className="w-full p-4">
        {/* Search input */}
        {shouldShowSearch && (
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm..."
              className="w-full px-3 py-2 pr-8 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Xóa tìm kiếm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* No results message */}
        <p className="text-sm text-muted-foreground">
          Không tìm thấy kết quả cho &quot;{searchQuery}&quot;
        </p>
      </div>
    );
  }
  
  /**
   * Main render
   */
  return (
    <div className="w-full">
      {/* Search input */}
      {shouldShowSearch && (
        <div className="p-4 pb-2">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm..."
              className="w-full pl-9 pr-8 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Xóa tìm kiếm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Navigation tree */}
      <nav className="p-2" aria-label="Cây điều hướng nội dung">
        <div className="space-y-1">
          {filteredTree.map((node) => (
            <NavigationNode
              key={node.id}
              node={node}
              expandedIds={expandedIds}
              onToggle={toggleNode}
              onNodeClick={onNodeClick}
              level={0}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}
