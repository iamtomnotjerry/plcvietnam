'use client';

import type { ReactNode } from 'react';

export interface HomeSectionHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

/**
 * Shared homepage section title block — matches hero eyebrow + serif rhythm.
 */
export function HomeSectionHeader({ eyebrow, title, subtitle, action }: HomeSectionHeaderProps) {
  return (
    <div className="mb-10 md:mb-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span
              className="h-1 w-8 shrink-0 rounded-full bg-gradient-to-r from-primary via-primary/85 to-accent"
              aria-hidden
            />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
          </div>
          <h2
            className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
            style={{ fontFamily: 'var(--font-serif), ui-serif, Georgia, serif' }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
