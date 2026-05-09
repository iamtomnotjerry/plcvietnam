/**
 * TagList Component
 * Display tag chips for navigation
 * Validates Requirements: 12.1, 12.2
 */

'use client';

import { Link } from '@/i18n/navigation';
import type { Tag } from '@/lib/types/domain';
import { tagHref } from '@/lib/utils/routes';
import { useTranslations } from 'next-intl';

export interface TagListProps {
  tags: Tag[];
  variant?: 'default' | 'compact';
  showCount?: boolean;
}

/**
 * TagList Component
 *
 * Displays a list of tags as clickable chips
 * - Responsive grid layout
 * - Optional post count display
 * - Hover effects for interactivity
 */
export function TagList({ tags, variant = 'default', showCount = false }: TagListProps) {
  const t = useTranslations('tags');
  if (tags.length === 0) {
    return null;
  }

  /**
   * Get tag chip size based on variant
   */
  const getChipSize = () => {
    if (variant === 'compact') {
      return 'px-2.5 py-1 text-xs';
    }
    return 'px-3 py-1.5 text-sm';
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={tagHref(tag.slug)}
          className={`
            inline-flex items-center gap-1.5
            ${getChipSize()}
            rounded-full
            bg-secondary text-secondary-foreground
            border border-border
            transition-all duration-200
            hover:bg-primary hover:text-primary-foreground
            hover:border-primary
            cursor-pointer
            font-medium
          `}
          aria-label={t('chipAriaLabel', { name: tag.name })}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <span>{tag.name}</span>
          {showCount && <span className="opacity-70">({tag.postCount})</span>}
        </Link>
      ))}
    </div>
  );
}
