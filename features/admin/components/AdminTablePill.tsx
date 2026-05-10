import type { ReactNode } from 'react';

const VARIANT_CLASS = {
  success:
    'border-emerald-700 bg-emerald-50 text-emerald-900 dark:border-emerald-400/70 dark:bg-emerald-900 dark:text-emerald-100',
  warning:
    'border-amber-700 bg-amber-50 text-amber-950 dark:border-amber-500/60 dark:bg-amber-950 dark:text-amber-100',
  primary:
    'border-primary bg-primary/[0.12] text-primary dark:border-primary/55 dark:bg-primary/[0.15] dark:text-primary',
  neutral:
    'border-border bg-muted/50 text-foreground dark:border-border dark:bg-muted/60 dark:text-foreground',
  highlight:
    'border-yellow-600 bg-yellow-50 text-yellow-950 dark:border-yellow-500/55 dark:bg-yellow-950 dark:text-yellow-100',
} as const;

export type AdminTablePillVariant = keyof typeof VARIANT_CLASS;

type AdminTablePillProps = {
  variant: AdminTablePillVariant;
  children: ReactNode;
  className?: string;
};

export function AdminTablePill({ variant, children, className = '' }: AdminTablePillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-xs font-semibold ${VARIANT_CLASS[variant]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
