/**
 * PostCard Component
 * Display post summary in lists with multiple variants
 * Validates Requirements: 2.2, 3.1, 3.2, 3.3
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/lib/types/domain';
import { postHref } from '@/lib/utils/routes';
import { formatDate } from '@/lib/utils/date';
import { truncate } from '@/lib/utils/text';
import { Badge } from '@/components/ui/Badge';

export interface PostCardProps {
  post: Post;
  variant?: 'default' | 'compact' | 'featured';
  showCategory?: boolean;
  showThumbnail?: boolean;
}

function isValidImageUrl(url: string | undefined | null): url is string {
  if (!url || url.trim() === '') return false;
  return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
}

const VARIANT_CONFIG = {
  featured: {
    imageHeight: 'h-[300px]',
    padding: 'p-6',
    titleSize: 'text-2xl',
    titleMinH: 'min-h-[4rem]', // text-2xl line-height ~2rem × 2
    excerptLines: 'line-clamp-3',
  },
  compact: {
    imageHeight: 'h-[160px]',
    padding: 'p-4',
    titleSize: 'text-base',
    titleMinH: 'min-h-[3rem]', // text-base line-height ~1.5rem × 2
    excerptLines: 'line-clamp-2',
  },
  default: {
    imageHeight: 'h-[200px]',
    padding: 'p-5',
    titleSize: 'text-lg',
    titleMinH: 'min-h-[3.5rem]', // text-lg line-height ~1.75rem × 2
    excerptLines: 'line-clamp-3',
  },
} as const;

/**
 * PostCard Component
 *
 * Displays post summary with:
 * - Title (truncated to 2 lines)
 * - Excerpt (max 200 chars)
 * - Publication date
 * - Reading time
 * - Category name (optional)
 * - Thumbnail image (optional)
 *
 * Variants:
 * - default: Full card with all metadata
 * - compact: Smaller card for grids
 * - featured: Larger card with emphasis
 */
export function PostCard({
  post,
  variant = 'default',
  showCategory = true,
  showThumbnail = true,
}: PostCardProps) {
  // Validate post has required data - graceful fallback instead of null
  const fieldSlug = post.category?.field?.slug;
  const categorySlug = post.category?.slug;

  // Build URL - fallback to posts page if category missing
  const postUrl =
    fieldSlug && categorySlug ? postHref(fieldSlug, categorySlug, post.slug) : `/posts`;
  const config = VARIANT_CONFIG[variant];

  return (
    <Link
      href={postUrl}
      className="group block h-full bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 cursor-pointer"
    >
      {/* Thumbnail */}
      {showThumbnail && isValidImageUrl(post.thumbnailUrl) && (
        <div className={`relative w-full overflow-hidden rounded-t-lg ${config.imageHeight}`}>
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Content */}
      <div className={config.padding}>
        {/* Category badge */}
        {showCategory && post.category && (
          <div className="mb-3">
            <Badge>{post.category.name}</Badge>
          </div>
        )}

        {/* Title — always occupies exactly 2 lines for consistent card height */}
        <h3
          className={`${config.titleSize} ${config.titleMinH} font-semibold text-card-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200`}
        >
          {post.title}
        </h3>

        {/* Excerpt - max 200 chars */}
        <p className={`text-sm text-muted-foreground ${config.excerptLines} mb-4`}>
          {truncate(post.excerpt, 200)}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {/* Publication date */}
          <div className="flex items-center gap-1">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
          </div>

          {/* Reading time */}
          <div className="flex items-center gap-1">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{post.readingTimeMinutes} phút đọc</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
