/**
 * RecentPostsSection Component
 * Display 6 most recent posts in grid layout
 * Validates Requirements: 11.3
 */

'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { PostCard } from '@/features/posts/components';
import type { Post } from '@/lib/types/domain';

export interface RecentPostsSectionProps {
  posts: Post[]; // 6 most recent
}

/**
 * RecentPostsSection Component
 *
 * Displays:
 * - Section heading: "Bài viết mới nhất"
 * - Grid of 6 PostCard components (variant='compact')
 * - "Xem tất cả" link to all posts
 */
export function RecentPostsSection({ posts }: RecentPostsSectionProps) {
  const t = useTranslations('home');
  // Limit to 6 posts
  const displayPosts = posts.slice(0, 6);

  if (displayPosts.length === 0) {
    return null;
  }

  return (
    <section id="recent-posts" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
              style={{ fontFamily: 'var(--font-serif), ui-serif, Georgia, serif' }}
            >
              {t('recentHeading')}
            </h2>
            <p className="mt-2 text-muted-foreground">{t('recentSub')}</p>
          </div>
          <Link
            href="/posts"
            prefetch
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            {t('seeAllPosts')}
            <span aria-hidden>→</span>
          </Link>
        </div>

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
