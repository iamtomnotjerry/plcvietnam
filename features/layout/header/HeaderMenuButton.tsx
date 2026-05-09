'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { headerSpringSnappy } from '@/features/layout/header/header-motion';

interface HeaderMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

/**
 * Mobile menu toggle — 44×44 target, animated icon cross-fade + micro 3D press.
 */
export function HeaderMenuButton({ isOpen, onClick }: HeaderMenuButtonProps) {
  const t = useTranslations('nav');
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? t('drawerClose') : t('menuOpen')}
      aria-expanded={isOpen}
      whileTap={reducedMotion ? undefined : { scale: 0.94, rotateX: 4 }}
      whileHover={reducedMotion ? undefined : { scale: 1.02, rotateY: -3, translateZ: 4 }}
      transition={headerSpringSnappy}
      style={{ transformStyle: 'preserve-3d' }}
      className="
        inline-flex h-11 w-11 cursor-pointer items-center justify-center
        rounded-xl border border-border/80 bg-background/90 text-muted-foreground shadow-sm
        backdrop-blur-sm transition-colors
        hover:border-primary/25 hover:bg-muted/80 hover:text-foreground
        focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
      "
    >
      <span className="relative h-5 w-5" aria-hidden>
        <motion.span
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{
            opacity: isOpen ? 0 : 1,
            rotate: isOpen ? 90 : 0,
            scale: isOpen ? 0.5 : 1,
          }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
        >
          <Menu className="h-5 w-5" strokeWidth={2} />
        </motion.span>
        <motion.span
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{
            opacity: isOpen ? 1 : 0,
            rotate: isOpen ? 0 : -90,
            scale: isOpen ? 1 : 0.5,
          }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.2 }}
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </motion.span>
      </span>
    </motion.button>
  );
}
