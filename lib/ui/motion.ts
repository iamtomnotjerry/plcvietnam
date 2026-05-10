/**
 * Shared motion tokens and Framer Motion variants for consistent animation across the app.
 * Prefer importing from here instead of duplicating easing/stagger values.
 */

import type { Variants } from 'framer-motion';

/** Smooth ease-out curve (matches former footer preset). */
export const motionEaseOut = [0.22, 1, 0.36, 1] as const;

export const motionDuration = {
  fast: 0.35,
  medium: 0.45,
  slow: 0.5,
} as const;

/** Header nav / micro-interactions — shared with header-motion re-export. */
export const headerSpringSnappy = {
  type: 'spring' as const,
  stiffness: 440,
  damping: 34,
};

/** Parent: stagger children (footer strip, grids). */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

/** Child: fade up (footer columns, link lists). */
export const fadeUpItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDuration.medium, ease: motionEaseOut },
  },
};

/** Card-style entrance with slight scale (footer value cards). */
export const cardLiftVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: motionDuration.slow, ease: motionEaseOut },
  },
};

/** Section fade-up for whileInView templates (post/book/about). */
export const sectionRevealVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDuration.medium, ease: motionEaseOut },
  },
};
