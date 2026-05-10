'use client';

import { CellFullTextTooltip } from '@/components/ui/Tooltip';
import {
  ADMIN_TABLE_DESCRIPTION_MAX,
  ADMIN_TABLE_LABEL_MAX,
  ADMIN_TABLE_SECONDARY_MAX,
  ADMIN_TABLE_SLUG_MAX,
  truncateForTableDisplay,
} from '@/lib/admin/table-text-truncate';

const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export type AdminTruncatedCellVariant = 'slug' | 'label' | 'description' | 'muted';

const spanClass: Record<AdminTruncatedCellVariant, string> = {
  slug: `inline-block max-w-full cursor-default font-mono text-xs text-muted-foreground ${focusRing}`,
  label: `inline-block max-w-full cursor-default min-w-0 font-medium text-foreground ${focusRing}`,
  description: `inline-block max-w-full cursor-default text-sm text-muted-foreground ${focusRing}`,
  muted: `inline-block max-w-full cursor-default text-sm text-muted-foreground ${focusRing}`,
};

const defaultMax: Record<AdminTruncatedCellVariant, number> = {
  slug: ADMIN_TABLE_SLUG_MAX,
  label: ADMIN_TABLE_LABEL_MAX,
  description: ADMIN_TABLE_DESCRIPTION_MAX,
  muted: ADMIN_TABLE_SECONDARY_MAX,
};

const tooltipPanelClass: Record<AdminTruncatedCellVariant, string> = {
  slug: 'font-mono text-[11px] leading-snug',
  label: 'text-xs leading-snug',
  description: 'text-xs leading-snug',
  muted: 'text-xs leading-snug',
};

type AdminTruncatedCellProps = {
  value: string;
  variant: AdminTruncatedCellVariant;
  maxLength?: number;
};

export function AdminTruncatedCell({ value, variant, maxLength }: AdminTruncatedCellProps) {
  const max = maxLength ?? defaultMax[variant];
  const { text, truncated } = truncateForTableDisplay(value, max);
  const inner = (
    <span
      className={spanClass[variant]}
      tabIndex={truncated ? 0 : undefined}
      aria-label={truncated ? value : undefined}
    >
      {text}
    </span>
  );
  if (!truncated) return inner;
  return (
    <CellFullTextTooltip fullText={value} contentClassName={tooltipPanelClass[variant]}>
      {inner}
    </CellFullTextTooltip>
  );
}
