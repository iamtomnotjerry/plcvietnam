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

export interface PostCardProps {
  post: Post;
  variant?: 'default' | 'compact' | 'featured';
  showCategory?: boolean;
  showThumbnail?: boolean;
}

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
  const fieldSlug = post.category?.field?.slug ?? '';
  const categorySlug = post.category?.slug ?? '';
  const postUrl = postHref(fieldSlug, categorySlug, post.slug);
  
  /**
   * Format date to Vietnamese locale
   */
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };
  
  /**
   * Truncate excerpt to max 200 characters
   */
  const truncateExcerpt = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };
  
  /**
   * Render thumbnail image if available and enabled
   */
  const renderThumbnail = () => {
    if (!showThumbnail || !post.thumbnailUrl) return null;
    
    const imageHeight = variant === 'featured' ? 300 : variant === 'compact' ? 160 : 200;
    
    return (
      <div className={`relative w-full overflow-hidden rounded-t-lg ${
        variant === 'featured' ? 'h-[300px]' : variant === 'compact' ? 'h-[160px]' : 'h-[200px]'
      }`}>
        <Image
          src={post.thumbnailUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
    );
  };
  
  /**
   * Render category badge
   */
  const renderCategory = () => {
    if (!showCategory || !post.category) return null;
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
        {post.category.name}
      </span>
    );
  };
  
  /**
   * Get card padding based on variant
   */
  const getCardPadding = () => {
    if (variant === 'featured') return 'p-6';
    if (variant === 'compact') return 'p-4';
    return 'p-5';
  };
  
  /**
   * Get title size based on variant
   */
  const getTitleSize = () => {
    if (variant === 'featured') return 'text-2xl';
    if (variant === 'compact') return 'text-base';
    return 'text-lg';
  };
  
  return (
    <Link
      href={postUrl}
      className={`
        group block h-full
        bg-card border border-border rounded-lg
        overflow-hidden
        transition-all duration-200
        hover:shadow-lg hover:border-primary/50
        cursor-pointer
      `}
    >
      {/* Thumbnail */}
      {renderThumbnail()}
      
      {/* Content */}
      <div className={getCardPadding()}>
        {/* Category badge */}
        {showCategory && post.category && (
          <div className="mb-3">
            {renderCategory()}
          </div>
        )}
        
        {/* Title - truncated to 2 lines */}
        <h3 className={`
          ${getTitleSize()} font-semibold
          text-card-foreground
          line-clamp-2
          mb-2
          group-hover:text-primary
          transition-colors duration-200
        `}>
          {post.title}
        </h3>
        
        {/* Excerpt - max 200 chars */}
        <p className={`
          text-sm text-muted-foreground
          line-clamp-3
          mb-4
          ${variant === 'compact' ? 'line-clamp-2' : 'line-clamp-3'}
        `}>
          {truncateExcerpt(post.excerpt)}
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
            <span>{formatDate(post.publishedAt)}</span>
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
