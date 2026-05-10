'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export interface PostComposerModalFrameProps {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
}

export function PostComposerModalFrame({
  title,
  closeLabel,
  onClose,
  children,
}: PostComposerModalFrameProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-stretch justify-center bg-black/55 p-0 sm:p-3 md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-post-composer-title"
    >
      <div className="flex h-full max-h-[100dvh] w-full max-w-[1920px] flex-col overflow-hidden rounded-none border-0 bg-background shadow-2xl sm:rounded-xl sm:border sm:border-border md:max-h-[96dvh]">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-sm">
          <h2
            id="admin-post-composer-title"
            className="text-base font-semibold text-foreground md:text-lg"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={closeLabel}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
