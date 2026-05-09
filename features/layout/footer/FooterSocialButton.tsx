'use client';

import type { ComponentType, SVGProps } from 'react';
import { motion } from 'framer-motion';
import { footerEase } from '@/features/layout/footer/footer-motion';

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface FooterSocialButtonProps {
  href: string;
  label: string;
  Icon: SvgIcon;
  reducedMotion: boolean;
}

export function FooterSocialButton({ href, label, Icon, reducedMotion }: FooterSocialButtonProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary/35 hover:text-primary"
      whileHover={
        reducedMotion ? undefined : { scale: 1.06, transition: { duration: 0.2, ease: footerEase } }
      }
      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--color-primary) 22%, transparent), transparent 70%)',
        }}
      />
      <Icon className="relative z-[1] h-[1.15rem] w-[1.15rem]" />
    </motion.a>
  );
}
