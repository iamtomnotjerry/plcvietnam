'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import { usePathname } from '@/i18n/navigation';
import { tagHref } from '@/lib/utils/routes';
import type { Tag as TagType } from '@/lib/types/domain';
import { NavigationNodeRow } from './NavigationNodeRow';
import { SkeletonNavigationTree } from '@/components/ui/SkeletonNavigationTree';
import { fadeUpItemVariants, staggerContainerVariants } from '@/lib/ui/motion';

const ROW_PAD_LEFT = 10;
const chevronSpacer = <span className="w-4 shrink-0" aria-hidden />;

export interface NavigationTagListProps {
  onLinkClick?: () => void;
}

export function NavigationTagList({ onLinkClick }: NavigationTagListProps) {
  const t = useTranslations('navigationTree');
  const pathname = usePathname();
  const [tags, setTags] = useState<TagType[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetch('/api/tags')
      .then((res) => {
        if (!res.ok) throw new Error('FETCH_TAGS_FAILED');
        return res.json() as Promise<TagType[]>;
      })
      .then((data) => {
        if (!cancelled) setTags(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setError(new Error('FETCH_TAGS_FAILED'));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(() => {
    if (!tags) return [];
    return [...tags].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  }, [tags]);

  if (tags === null && !error) {
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
          <p className="font-semibold">{t('tagLoadError')}</p>
        </div>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="w-full p-4">
        <p className="text-sm text-muted-foreground">{t('tagEmpty')}</p>
      </div>
    );
  }

  const tagIcon = <Tag className="h-[1.05rem] w-[1.05rem] shrink-0" strokeWidth={2} aria-hidden />;

  return (
    <nav className="p-1.5 sm:p-2" aria-label={t('tagNavAriaLabel')}>
      <motion.div
        className="space-y-0.5"
        initial="hidden"
        animate="show"
        variants={staggerContainerVariants}
      >
        {sorted.map((tag) => {
          const href = tagHref(tag.slug);
          const isActive = pathname === href;
          return (
            <motion.div key={tag.id} variants={fadeUpItemVariants} className="overflow-visible">
              <NavigationNodeRow
                mode="link"
                href={href}
                isActive={isActive}
                paddingLeftPx={ROW_PAD_LEFT}
                onLinkClick={onLinkClick}
                chevron={chevronSpacer}
                typeIcon={tagIcon}
                label={tag.name}
                postCount={tag.postCount}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </nav>
  );
}
