/**
 * NavigationNode Component
 * Recursive tree node renderer with expand/collapse animations
 * Validates Requirements: 1.2, 1.3, 1.4
 */

'use client';

import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { MouseEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronRight, FileText, Folder, FolderTree } from 'lucide-react';
import type { NavigationNode as NavigationNodeType } from '@/lib/types/domain';
import { headerSpringSnappy } from '@/lib/ui/motion';
import { NavigationNodeRow } from './NavigationNodeRow';

interface NavigationNodeProps {
  node: NavigationNodeType;
  expandedIds: Set<string>;
  onToggle: (nodeId: string) => void;
  onNodeClick?: (node: NavigationNodeType) => void;
  level?: number;
}

function paddingLeftForLevel(level: number): number {
  const basePadding = 10;
  const increment = 14;
  return basePadding + level * increment;
}

export function NavigationNode({
  node,
  expandedIds,
  onToggle,
  onNodeClick,
  level = 0,
}: NavigationNodeProps) {
  const t = useTranslations('navigationTree');
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isExpandable = node.type === 'field' || hasChildren;
  const isActive = pathname === node.url;

  const paddingLeft = paddingLeftForLevel(level);

  const handleLinkClick = () => {
    onNodeClick?.(node);
  };

  const handleToggleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onToggle(node.id);
    onNodeClick?.(node);
  };

  const typeIcon =
    node.type === 'field' ? (
      <FolderTree className="h-[1.125rem] w-[1.125rem] shrink-0" strokeWidth={2} aria-hidden />
    ) : node.type === 'category' ? (
      <Folder className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
    ) : (
      <FileText className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
    );

  const chevron = isExpandable ? (
    <motion.span
      className="flex w-4 shrink-0 justify-center text-muted-foreground"
      initial={false}
      animate={{ rotate: isExpanded ? 90 : 0 }}
      transition={reduceMotion ? { duration: 0 } : headerSpringSnappy}
    >
      <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
    </motion.span>
  ) : (
    <span className="w-4 shrink-0" aria-hidden />
  );

  return (
    <div className="w-full">
      {isExpandable ? (
        <NavigationNodeRow
          mode="button"
          isActive={isActive}
          paddingLeftPx={paddingLeft}
          onToggleClick={handleToggleClick}
          chevron={chevron}
          typeIcon={typeIcon}
          label={node.label}
          postCount={node.postCount}
          ariaExpanded={isExpanded}
          ariaControls={`navigation-node-children-${node.id}`}
        />
      ) : (
        <NavigationNodeRow
          mode="link"
          href={node.url}
          isActive={isActive}
          paddingLeftPx={paddingLeft}
          onLinkClick={handleLinkClick}
          chevron={chevron}
          typeIcon={typeIcon}
          label={node.label}
          postCount={node.postCount}
        />
      )}

      {isExpandable ? (
        <div
          id={`navigation-node-children-${node.id}`}
          className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="relative py-0.5">
              {hasChildren ? (
                <>
                  <div
                    className="pointer-events-none absolute bottom-1 left-0 top-1 w-px bg-gradient-to-b from-border via-border/60 to-transparent"
                    style={{ marginLeft: `${paddingLeft + 10}px` }}
                    aria-hidden
                  />
                  {node.children!.map((child) => (
                    <NavigationNode
                      key={child.id}
                      node={child}
                      expandedIds={expandedIds}
                      onToggle={onToggle}
                      onNodeClick={onNodeClick}
                      level={level + 1}
                    />
                  ))}
                </>
              ) : (
                <div
                  className="py-2 text-sm italic text-muted-foreground"
                  style={{ paddingLeft: `${paddingLeft + 28}px` }}
                >
                  {t('fieldNoCategories')}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
