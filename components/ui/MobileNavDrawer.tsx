/**
 * MobileNavDrawer Component
 * Slide-out navigation drawer for mobile viewports (<768px)
 * Validates Requirements: 16.2, 16.6
 */

'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { NavigationTree } from '@/features/navigation/components/NavigationTree';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * MobileNavDrawer
 *
 * - Slides in from the left when isOpen is true
 * - Shows a semi-transparent backdrop overlay
 * - Close button is 44×44px (w-11 h-11) per Requirement 16.6
 * - Traps focus inside the drawer when open for accessibility
 * - Closes on backdrop click or Escape key
 */
export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  /* Focus the close button when drawer opens */
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  /* Close on Escape key; trap focus inside drawer */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;

      const drawer = drawerRef.current;
      if (!drawer) return;

      const focusable = drawer.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  /* Prevent body scroll while drawer is open */
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
      {/* Backdrop overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`
          fixed inset-0 z-40
          bg-black/50
          transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
        className={`
          fixed top-0 left-0 z-50
          h-full w-72 max-w-[85vw]
          bg-white dark:bg-slate-900
          shadow-xl
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Drawer header with close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Điều hướng
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Đóng menu điều hướng"
            className="
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable navigation content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 border-b border-slate-200 p-3 dark:border-slate-700">
            {(
              [
                ['/', 'Trang chủ'],
                ['/posts', 'Bài viết'],
                ['/books', 'Sách'],
                ['/about', 'Giới thiệu'],
                ['/search', 'Tìm kiếm'],
              ] as const
            ).map(([href, label]) => (
              <Link
                key={href}
                href={href as Route}
                onClick={onClose}
                className="rounded-lg bg-slate-100 px-3 py-2 text-center text-sm font-medium text-slate-800 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                {label}
              </Link>
            ))}
          </div>
          <NavigationTree onNodeClick={onClose} />
        </div>
      </div>
    </>
  );
}
