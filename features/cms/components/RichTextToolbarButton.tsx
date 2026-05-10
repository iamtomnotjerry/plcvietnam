'use client';

import type { ReactNode } from 'react';

export function RichTextToolbarSeparator() {
  return <span className="mx-0.5 w-px self-stretch bg-border" aria-hidden />;
}

export function RichTextToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`
        rounded-md p-2 text-muted-foreground transition-colors
        hover:bg-muted hover:text-foreground
        disabled:pointer-events-none disabled:opacity-40
        ${active ? 'bg-muted text-foreground' : ''}
      `}
    >
      {children}
    </button>
  );
}
