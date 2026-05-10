/**
 * Mobile navigation drawer — slide-in panel + topic tree.
 * Keeps `-translate-x-full` / `translate-x-0` classes for existing tests.
 */

'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { NavigationTree } from '@/features/navigation/components/NavigationTree';
import { HEADER_MAIN_NAV } from '@/features/layout/header/header-nav-config';
import { headerSpringSnappy } from '@/features/layout/header/header-motion';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const tNav = useTranslations('nav');
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

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
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`
          fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px]
          transition-opacity duration-300
          ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}
        `}
      />

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={tNav('drawerAriaLabel')}
        className={`
          fixed top-0 left-0 z-50
          flex h-full w-72 max-w-[85vw] flex-col
          border-r border-border/55 bg-background/88 shadow-2xl shadow-black/15 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/72
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          boxShadow:
            '8px 0 40px -12px rgba(0,0,0,0.2), inset 1px 0 0 0 color-mix(in oklab, var(--color-primary) 12%, transparent)',
        }}
      >
        <div className="relative flex items-center justify-between border-b border-border/55 bg-gradient-to-br from-primary/[0.08] via-background/90 to-accent/[0.05] px-4 py-3 shadow-[inset_0_-1px_0_0_color-mix(in_oklab,white_35%,transparent)] backdrop-blur-md dark:shadow-[inset_0_-1px_0_0_color-mix(in_oklab,white_6%,transparent)]">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
            aria-hidden
          />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            {tNav('drawerTitle')}
          </span>
          <motion.button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={tNav('drawerClose')}
            whileTap={reducedMotion ? undefined : { scale: 0.92, rotateZ: 90 }}
            transition={headerSpringSnappy}
            className="
              inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl
              border border-border/60 bg-background/90 text-muted-foreground shadow-sm
              transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary
              focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
            "
          >
            <X className="h-5 w-5" strokeWidth={2} aria-hidden />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 border-b border-border/60 p-3">
            {HEADER_MAIN_NAV.map(({ href, navKey, Icon }) => (
              <Link
                key={href}
                href={href as Route}
                prefetch
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-muted/40 px-2 py-2.5 text-center text-xs font-semibold text-foreground shadow-sm transition-all hover:border-primary/35 hover:bg-primary/10 hover:text-primary"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                <span className="truncate">{tNav(navKey)}</span>
              </Link>
            ))}
          </div>
          <NavigationTree onNodeClick={onClose} />
        </div>
      </div>
    </>
  );
}
