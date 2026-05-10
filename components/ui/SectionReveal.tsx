'use client';

/**
 * Scroll-triggered fade-up using shared motion tokens — respects prefers-reduced-motion.
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { sectionRevealVariants } from '@/lib/ui/motion';

export interface SectionRevealProps {
  children: ReactNode;
  className?: string;
}

export function SectionReveal({ children, className = '' }: SectionRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={sectionRevealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-48px', amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
