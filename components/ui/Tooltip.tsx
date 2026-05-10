'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { type ComponentPropsWithoutRef, type ElementRef, type ReactNode, forwardRef } from 'react';

export const TooltipProvider = TooltipPrimitive.Provider;

export const TooltipRoot = TooltipPrimitive.Root;

export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className = '', sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={`z-[200] max-w-sm select-text rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${className}`}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

type CellFullTextTooltipProps = {
  fullText: string;
  children: ReactNode;
  /** Extra classes on tooltip panel (e.g. font-mono for slugs). */
  contentClassName?: string;
};

/** Full value on hover; use inside `TooltipProvider` (e.g. `AdminDataTable`). */
export function CellFullTextTooltip({
  fullText,
  children,
  contentClassName,
}: CellFullTextTooltipProps) {
  const panelClass = contentClassName?.trim() || 'font-mono text-[11px] leading-snug';
  return (
    <TooltipRoot>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top" className={`max-w-md ${panelClass}`.trim()}>
        <span className="break-all">{fullText}</span>
      </TooltipContent>
    </TooltipRoot>
  );
}

type SlugTooltipProps = {
  fullSlug: string;
  children: ReactNode;
};

/** @deprecated Prefer `CellFullTextTooltip` or `AdminTruncatedCell`. */
export function SlugTooltip({ fullSlug, children }: SlugTooltipProps) {
  return <CellFullTextTooltip fullText={fullSlug}>{children}</CellFullTextTooltip>;
}
