/**
 * RelatedPosts Component
 * Display related posts based on shared tags or same category
 * Validates Requirements: 12.4, 12.5
 */

'use client';

import { useTranslations } from 'next-intl';
import { Post } from '@/lib/types/domain';
import { PostCard } from './PostCard';

export interface RelatedPostsProps {
  /**
   * Array of related posts to display
   */
  posts: Post[];

  /**
   * Optional class name for styling
   */
  className?: string;
}

/**
 * RelatedPosts Component
 *
 * Displays a grid of related posts at the bottom of post detail page.
 * Posts are found using the findRelatedPosts algorithm which scores posts by:
 * - Shared tags: +2 points per tag
 * - Same category: +1 point
 * - Fallback: Recent posts from same category if no shared tags
 *
 * Features:
 * - Responsive grid layout (1-4 columns)
 * - Compact post cards
 * - Empty state handling
 *
 * Requirements:
 * - 12.4: Display up to 4 posts that share at least one tag
 * - 12.5: Fallback to same category posts if no shared tags
 */
export function RelatedPosts({ posts, className = '' }: RelatedPostsProps) {
  const t = useTranslations('posts');

  // Don't render if no related posts
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className={`mt-12 ${className}`}>
      {/* Section heading */}
      <h2 className="text-2xl font-semibold text-card-foreground mb-6">{t('relatedHeading')}</h2>

      {/* Related posts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} variant="compact" showTags showThumbnail={true} />
        ))}
      </div>
    </section>
  );
}
