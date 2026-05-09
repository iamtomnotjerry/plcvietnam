'use client';

import { motion } from 'framer-motion';

interface FooterDecorativeBgProps {
  reducedMotion: boolean;
}

export function FooterDecorativeBg({ reducedMotion }: FooterDecorativeBgProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,color-mix(in_oklab,var(--color-primary)_6%,transparent)_48%,transparent_56%)]" />
      {!reducedMotion && (
        <motion.div
          className="absolute -left-1/4 top-1/3 h-64 w-[150%] opacity-[0.07]"
          style={{
            background:
              'repeating-linear-gradient(90deg, var(--color-primary) 0px, var(--color-primary) 1px, transparent 1px, transparent 24px)',
          }}
          animate={{ x: ['0%', '4%'] }}
          transition={{ duration: 22, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}
