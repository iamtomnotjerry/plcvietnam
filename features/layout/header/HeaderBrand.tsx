'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { headerSpringSnappy } from '@/features/layout/header/header-motion';

export function HeaderBrand() {
  const tSite = useTranslations('site');
  const reducedMotion = useReducedMotion();

  return (
    <Link
      href="/"
      className="group flex shrink-0 items-center gap-2.5 rounded-xl outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
    >
      <motion.span
        className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary shadow-md shadow-primary/25 ring-1 ring-primary/30 sm:h-10 sm:w-10"
        style={{
          transformStyle: 'preserve-3d',
          boxShadow:
            '0 4px 14px -2px color-mix(in oklab, var(--color-primary) 45%, transparent), inset 0 1px 0 0 rgba(255,255,255,0.2)',
        }}
        whileHover={
          reducedMotion
            ? undefined
            : {
                rotateX: -8,
                rotateY: 6,
                translateZ: 12,
                scale: 1.04,
              }
        }
        transition={headerSpringSnappy}
      >
        <Image
          src="/logo.jpg"
          alt={tSite('logoAlt')}
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      </motion.span>
      <span className="hidden font-serif text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary sm:inline">
        {tSite('brand')}
      </span>
    </Link>
  );
}
