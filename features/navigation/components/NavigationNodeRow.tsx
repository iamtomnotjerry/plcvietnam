'use client';

import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import type { MouseEvent, ReactNode } from 'react';

const rowBase =
  'flex w-full items-center gap-2 rounded-xl py-2 pl-3 pr-3 text-left text-sm outline-none transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const rowInactive =
  'cursor-pointer border border-transparent text-foreground hover:border-primary/18 hover:bg-primary/[0.07] hover:shadow-sm max-md:active:bg-muted/80 md:hover:-translate-y-px md:hover:shadow-[0_8px_28px_-12px_color-mix(in_oklab,var(--color-primary)_22%,transparent)]';

const rowActive =
  'cursor-pointer border-primary/40 bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-primary-foreground/20';

export interface NavigationNodeRowProps {
  mode: 'button' | 'link';
  href?: string;
  isActive: boolean;
  paddingLeftPx: number;
  onLinkClick?: () => void;
  onToggleClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  chevron: ReactNode;
  typeIcon: ReactNode;
  label: string;
  postCount?: number;
  ariaExpanded?: boolean;
  ariaControls?: string;
}

export function NavigationNodeRow({
  mode,
  href,
  isActive,
  paddingLeftPx,
  onLinkClick,
  onToggleClick,
  chevron,
  typeIcon,
  label,
  postCount,
  ariaExpanded,
  ariaControls,
}: NavigationNodeRowProps) {
  const palette = isActive ? rowActive : rowInactive;

  const badgeClass = isActive
    ? 'bg-primary-foreground/25 text-primary-foreground'
    : 'bg-muted/90 text-muted-foreground';

  const iconWrapClass = isActive ? 'text-primary-foreground' : 'text-muted-foreground';

  const content = (
    <>
      {chevron}
      <span className={`shrink-0 transition-colors ${iconWrapClass}`}>{typeIcon}</span>
      <span className="min-w-0 flex-1 truncate font-medium tracking-tight">{label}</span>
      {postCount !== undefined && postCount > 0 ? (
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold tabular-nums ${badgeClass}`}
        >
          {postCount}
        </span>
      ) : null}
    </>
  );

  if (mode === 'button') {
    return (
      <button
        type="button"
        onClick={onToggleClick}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        className={`${rowBase} ${palette}`}
        style={{ paddingLeft: `${paddingLeftPx}px` }}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={(href ?? '/') as Route}
      onClick={onLinkClick}
      className={`${rowBase} ${palette}`}
      style={{ paddingLeft: `${paddingLeftPx}px` }}
    >
      {content}
    </Link>
  );
}
