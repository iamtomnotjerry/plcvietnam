/**
 * RecentPostsSection Component
 * Display 6 most recent posts in grid layout
 * Validates Requirements: 11.3
 */

'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { PostCard } from '@/features/posts/components';
import type { Post } from '@/lib/types/domain';
import { HomeSectionHeader } from './HomeSectionHeader';

export interface RecentPostsSectionProps {
  posts: Post[];
}

export function RecentPostsSection({ posts }: RecentPostsSectionProps) {
  const t = useTranslations('home');
  const displayPosts = posts.slice(0, 6);

  if (displayPosts.length === 0) {
    return null;
  }

  const seeAll = (
    <Link
      href="/posts"
      prefetch
      className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-card/75 px-4 py-2.5 text-sm font-semibold text-primary shadow-sm backdrop-blur-sm transition-all hover:border-primary/35 hover:bg-primary/10"
    >
      {t('seeAllPosts')}
      <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
    </Link>
  );

  return (
    <section id="recent-posts" className="section-surface-glass py-16 md:py-24">
      <div className="editorial-container relative">
        <HomeSectionHeader
          eyebrow={t('recentEyebrow')}
          title={t('recentHeading')}
          subtitle={t('recentSub')}
          action={seeAll}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <PostCard post={post} variant="compact" showCategory={true} showThumbnail={true} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
