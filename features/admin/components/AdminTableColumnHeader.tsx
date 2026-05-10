'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

const ICON_CLASS = 'h-4 w-4 shrink-0 text-muted-foreground';

type AdminTableColumnHeaderProps = {
  icon: LucideIcon;
  children: ReactNode;
  align?: 'left' | 'right';
};

/** Shared column title row: icon + label (matches admin posts table). */
export function AdminTableColumnHeader({
  icon: Icon,
  children,
  align = 'left',
}: AdminTableColumnHeaderProps) {
  const row = (
    <span className="inline-flex items-center gap-2.5">
      <Icon className={ICON_CLASS} aria-hidden strokeWidth={2} />
      {children}
    </span>
  );
  if (align === 'right') {
    return <span className="flex w-full justify-end">{row}</span>;
  }
  return row;
}
