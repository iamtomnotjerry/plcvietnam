/**
 * NavigationTree Component
 * Main container for hierarchical navigation with search functionality
 * Validates Requirements: 1.6
 */

'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useNavigationTree } from '../hooks/useNavigationTree';
import { filterNavigationTreeByQuery } from '../lib/filter-navigation-tree';
import { NavigationNode } from './NavigationNode';
import { NavigationTreeSearch } from './NavigationTreeSearch';
import type { NavigationTreeProps } from '../types';
import { SkeletonNavigationTree } from '@/components/ui/SkeletonNavigationTree';
import { fadeUpItemVariants, staggerContainerVariants } from '@/lib/ui/motion';

export function NavigationTree({
  initialExpanded,
  onNodeClick,
  searchable = true,
}: NavigationTreeProps) {
  const t = useTranslations('navigationTree');
  const { tree, expandedIds, toggleNode, isLoading, error } = useNavigationTree(initialExpanded);

  const [searchQuery, setSearchQuery] = useState('');

  const shouldShowSearch = searchable && tree.length > 10;

  const filteredTree = useMemo(
    () => filterNavigationTreeByQuery(tree, searchQuery),
    [tree, searchQuery]
  );

  if (isLoading) {
    return (
      <div className="w-full p-3">
        <SkeletonNavigationTree />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive shadow-sm">
          <p className="font-semibold">{t('loadError')}</p>
          <p className="mt-1 text-xs opacity-90">{error.message}</p>
        </div>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="w-full p-4">
        <p className="text-sm text-muted-foreground">{t('emptyTree')}</p>
      </div>
    );
  }

  if (searchQuery && filteredTree.length === 0) {
    return (
      <div className="w-full px-3 pb-3 pt-3">
        {shouldShowSearch ? (
          <div className="mb-3">
            <NavigationTreeSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder={t('searchPlaceholder')}
              clearLabel={t('clearSearch')}
            />
          </div>
        ) : null}
        <p className="rounded-md border border-border/60 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
          {t('noResults', { query: searchQuery })}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {shouldShowSearch ? (
        <div className="border-b border-border/40 bg-gradient-to-b from-muted/25 to-transparent px-2.5 pb-2.5 pt-2.5">
          <NavigationTreeSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder={t('searchPlaceholder')}
            clearLabel={t('clearSearch')}
          />
        </div>
      ) : null}

      <nav className="p-1.5 sm:p-2" aria-label={t('navAriaLabel')}>
        <motion.div
          className="space-y-0.5"
          initial="hidden"
          animate="show"
          variants={staggerContainerVariants}
        >
          {filteredTree.map((node) => (
            <motion.div key={node.id} variants={fadeUpItemVariants} className="overflow-visible">
              <NavigationNode
                node={node}
                expandedIds={expandedIds}
                onToggle={toggleNode}
                onNodeClick={onNodeClick}
                level={0}
              />
            </motion.div>
          ))}
        </motion.div>
      </nav>
    </div>
  );
}
