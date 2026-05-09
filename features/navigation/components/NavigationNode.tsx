/**
 * NavigationNode Component
 * Recursive tree node renderer with expand/collapse animations
 * Validates Requirements: 1.2, 1.3, 1.4
 */

'use client';

import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { MouseEvent } from 'react';
import type { NavigationNode as NavigationNodeType } from '@/lib/types/domain';

interface NavigationNodeProps {
  /**
   * The navigation node data to render
   */
  node: NavigationNodeType;

  /**
   * Expanded node ids (each row uses its own id, not the parent's state)
   */
  expandedIds: Set<string>;

  /**
   * Callback when the node is clicked
   */
  onToggle: (nodeId: string) => void;

  /**
   * Optional callback for custom node click handling
   */
  onNodeClick?: (node: NavigationNodeType) => void;

  /**
   * Current nesting level (0 = field, 1 = category, 2 = post)
   */
  level?: number;
}

/**
 * NavigationNode Component
 *
 * Renders a single node in the navigation tree with:
 * - Expand/collapse functionality for nodes with children
 * - Smooth height transitions using CSS
 * - Active state highlighting based on current route
 * - Click handlers for navigation
 * - Recursive rendering of child nodes
 *
 * Requirement 1.2: Expand Field to show Categories
 * Requirement 1.3: Expand Category to show Posts
 * Requirement 1.4: Navigate to Post detail page on click
 */
export function NavigationNode({
  node,
  expandedIds,
  onToggle,
  onNodeClick,
  level = 0,
}: NavigationNodeProps) {
  const t = useTranslations('navigationTree');
  const pathname = usePathname();
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);

  // Field nodes are always expandable (even without children)
  const isExpandable = node.type === 'field' || hasChildren;

  // Check if this node's URL matches the current route
  const isActive = pathname === node.url;

  /**
   * Handle node click
   * For expandable nodes (fields, categories with children), toggle expansion
   * For leaf nodes (posts), allow navigation
   */
  const handleLinkClick = () => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  const handleToggleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onToggle(node.id);
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  /**
   * Get indentation padding based on nesting level
   */
  const getPaddingLeft = () => {
    const basePadding = 12; // 0.75rem
    const increment = 16; // 1rem per level
    return basePadding + level * increment;
  };

  /**
   * Get icon based on node type
   * Using SVG icons instead of emojis per UI guidelines
   */
  const renderIcon = () => {
    if (node.type === 'field') {
      return (
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      );
    }

    if (node.type === 'category') {
      return (
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    }

    // Post type
    return (
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  };

  /**
   * Render chevron icon for expandable nodes
   */
  const renderChevron = () => {
    if (!isExpandable) return null;

    return (
      <svg
        className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
          isExpanded ? 'rotate-90' : ''
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    );
  };

  return (
    <div className="w-full">
      {/* Node button/link */}
      {isExpandable ? (
        <button
          type="button"
          onClick={handleToggleClick}
          aria-expanded={isExpanded}
          aria-controls={`navigation-node-children-${node.id}`}
          className={`
            flex items-center gap-2 w-full py-2 px-3 rounded-md
            text-sm transition-colors duration-200
            cursor-pointer text-left
            ${
              isActive
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-foreground hover:bg-muted hover:text-foreground'
            }
          `}
          style={{ paddingLeft: `${getPaddingLeft()}px` }}
        >
          {renderChevron()}
          <span className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'}>
            {renderIcon()}
          </span>
          <span className="flex-1 truncate">{node.label}</span>
          {node.postCount !== undefined && node.postCount > 0 && (
            <span
              className={`
                text-xs px-2 py-0.5 rounded-full
                ${
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {node.postCount}
            </span>
          )}
        </button>
      ) : (
        <Link
          href={node.url}
          onClick={handleLinkClick}
          className={`
            flex items-center gap-2 w-full py-2 px-3 rounded-md
            text-sm transition-colors duration-200
            cursor-pointer
            ${
              isActive
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-foreground hover:bg-muted hover:text-foreground'
            }
          `}
          style={{ paddingLeft: `${getPaddingLeft()}px` }}
        >
          <span className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'}>
            {renderIcon()}
          </span>
          <span className="flex-1 truncate">{node.label}</span>
          {node.postCount !== undefined && node.postCount > 0 && (
            <span
              className={`
                text-xs px-2 py-0.5 rounded-full
                ${
                  isActive
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }
              `}
            >
              {node.postCount}
            </span>
          )}
        </Link>
      )}

      {/* Children container with smooth height transition */}
      {isExpandable && (
        <div
          id={`navigation-node-children-${node.id}`}
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="py-1">
            {hasChildren ? (
              node.children!.map((child) => (
                <NavigationNode
                  key={child.id}
                  node={child}
                  expandedIds={expandedIds}
                  onToggle={onToggle}
                  onNodeClick={onNodeClick}
                  level={level + 1}
                />
              ))
            ) : (
              <div
                className="text-sm text-muted-foreground italic py-2 px-3"
                style={{ paddingLeft: `${getPaddingLeft() + 28}px` }}
              >
                {t('fieldNoCategories')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
