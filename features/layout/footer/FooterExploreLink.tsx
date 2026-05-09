'use client';

import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';

interface FooterExploreLinkProps {
  href: string;
  label: string;
  Icon: LucideIcon;
  reducedMotion: boolean;
}

export function FooterExploreLink({ href, label, Icon, reducedMotion }: FooterExploreLinkProps) {
  return (
    <motion.li
      whileHover={reducedMotion ? undefined : { x: 4 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      <Link
        href={href}
        className="group flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span className="border-b border-transparent group-hover:border-primary/40">{label}</span>
      </Link>
    </motion.li>
  );
}
