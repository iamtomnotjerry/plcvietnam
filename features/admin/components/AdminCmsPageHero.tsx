'use client';

import type { ReactNode } from 'react';

type AdminCmsPageHeroProps = {
  title: string;
  subtitle: string;
  /** Pre-rendered icon (e.g. `<FileText className="h-6 w-6" aria-hidden />`) — do not pass component refs from a Server Component. */
  icon: ReactNode;
  /** Primary control (e.g. Link or button) — right side on desktop */
  action?: ReactNode;
  /** Extra block under subtitle (e.g. mono slug on edit post) */
  detail?: ReactNode;
};

export function AdminCmsPageHero({ title, subtitle, icon, action, detail }: AdminCmsPageHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card/98 to-muted/30 p-6 shadow-[0_1px_0_0_color-mix(in_oklab,var(--color-border)_35%,transparent),0_24px_56px_-32px_rgba(0,0,0,0.14)] dark:shadow-[0_24px_56px_-32px_rgba(0,0,0,0.5)] md:p-8">
      <div
        className="pointer-events-none absolute -right-16 -top-28 h-56 w-56 rounded-full bg-primary/[0.08] blur-3xl dark:bg-primary/[0.11]"
        aria-hidden
      />
      <div className="relative flex min-w-0 flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-[inset_0_1px_0_0_color-mix(in_oklab,white_40%,transparent)]">
            {icon}
          </span>
          <div className="min-w-0">
            <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              {title}
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
            {detail ? <div className="mt-1.5 min-w-0">{detail}</div> : null}
          </div>
        </div>
        {action ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">{action}</div>
        ) : null}
      </div>
    </div>
  );
}
