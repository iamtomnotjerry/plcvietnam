/**
 * MobileSearchOverlay Component
 * Search icon button that triggers a full-width search overlay on mobile
 * Validates Requirements: 16.3
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { SearchInput } from '@/features/search/components/SearchInput';

/**
 * MobileSearchOverlay
 *
 * - Shows a 44×44px search icon button (visible on mobile, hidden on desktop)
 * - When clicked, renders SearchInput in overlay variant (full-screen)
 * - Closes on Escape key or when a result is selected
 */
export function MobileSearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  /* Close on Escape key */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  /* Prevent body scroll while overlay is open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Search icon button — visible on mobile, hidden on desktop */}
      <button
        type="button"
        onClick={open}
        aria-label="Mở tìm kiếm"
        className="
          md:hidden
          inline-flex items-center justify-center
          w-11 h-11
          rounded-lg
          cursor-pointer
          text-slate-600 dark:text-slate-300
          hover:bg-slate-100 dark:hover:bg-slate-800
          transition-colors duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {/* Full-screen overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tìm kiếm"
          className="
            fixed inset-0 z-50
            flex flex-col
            bg-background
            md:hidden
          "
        >
          {/* Overlay header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            {/* Inline search input (overlay variant) */}
            <div className="flex-1">
              <SearchInput variant="overlay" onResultClick={close} />
            </div>

            {/* Close button — 44×44px tap target */}
            <button
              type="button"
              onClick={close}
              aria-label="Đóng tìm kiếm"
              className="
                inline-flex items-center justify-center
                w-11 h-11 shrink-0
                rounded-lg
                cursor-pointer
                text-slate-600 dark:text-slate-300
                hover:bg-slate-100 dark:hover:bg-slate-800
                transition-colors duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
