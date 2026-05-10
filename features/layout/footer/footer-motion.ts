import type { Variants } from 'framer-motion';
import {
  motionEaseOut,
  staggerContainerVariants,
  fadeUpItemVariants,
  cardLiftVariants,
} from '@/lib/ui/motion';

/** @deprecated Prefer importing from `@/lib/ui/motion` — kept for stable imports in footer components. */
export const footerEase = motionEaseOut;

export const footerContainerVariants: Variants = staggerContainerVariants;

export const footerItemVariants: Variants = fadeUpItemVariants;

export const footerCardVariants: Variants = cardLiftVariants;
