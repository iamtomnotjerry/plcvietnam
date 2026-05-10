'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { FolderTree, Tag } from 'lucide-react';
import { headerSpringSnappy } from '@/lib/ui/motion';
import { NavigationTree } from './NavigationTree';
import { NavigationTagList } from './NavigationTagList';
import type { NavigationTreeProps } from '../types';

export interface NavigationSidebarModesProps extends Pick<
  NavigationTreeProps,
  'initialExpanded' | 'searchable'
> {
  onNavigate?: () => void;
}

export function NavigationSidebarModes({
  initialExpanded,
  searchable,
  onNavigate,
}: NavigationSidebarModesProps) {
  const t = useTranslations('navigationTree');
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<'topics' | 'tags'>('topics');

  const treeClick = onNavigate
    ? () => {
        onNavigate();
      }
    : undefined;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="relative shrink-0 border-b border-border/40 bg-gradient-to-r from-muted/25 via-muted/15 to-transparent px-2 py-2">
        <div
          className="relative rounded-2xl border border-border/50 bg-background/55 p-1 shadow-[inset_0_1px_0_0_color-mix(in_oklab,white_40%,transparent)] backdrop-blur-sm dark:bg-background/35 dark:shadow-[inset_0_1px_0_0_color-mix(in_oklab,white_8%,transparent)]"
          role="tablist"
          aria-label={t('modeSwitcherAriaLabel')}
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute top-1 bottom-1 z-0 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/88 shadow-lg shadow-primary/28 ring-1 ring-primary-foreground/20"
            initial={false}
            animate={{
              left: mode === 'topics' ? 4 : 'calc(8px + (100% - 12px) / 2)',
              width: 'calc((100% - 12px) / 2)',
            }}
            transition={reduceMotion ? { duration: 0 } : headerSpringSnappy}
          />
          <div className="relative z-10 flex gap-1">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'topics'}
              onClick={() => setMode('topics')}
              className={`flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold tracking-tight transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                mode === 'topics'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FolderTree className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
              <span className="truncate">{t('modeTopics')}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'tags'}
              onClick={() => setMode('tags')}
              className={`flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold tracking-tight transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                mode === 'tags'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Tag className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
              <span className="truncate">{t('modeTags')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {mode === 'topics' ? (
          <NavigationTree
            initialExpanded={initialExpanded}
            searchable={searchable}
            onNodeClick={treeClick}
          />
        ) : (
          <NavigationTagList onLinkClick={onNavigate} />
        )}
      </div>
    </div>
  );
}
