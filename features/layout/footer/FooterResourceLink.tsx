'use client';

import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { ExternalLink } from 'lucide-react';
import type { FooterResourceItem } from '@/features/layout/footer/footer-config';

interface FooterResourceLinkProps {
  item: FooterResourceItem;
  label: string;
  Icon: LucideIcon;
  reducedMotion: boolean;
}

export function FooterResourceLink({ item, label, Icon, reducedMotion }: FooterResourceLinkProps) {
  const content = (
    <>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <span className="flex flex-1 items-center gap-1 border-b border-transparent group-hover:border-primary/40">
        {label}
        {item.kind === 'external' && (
          <ExternalLink className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
        )}
      </span>
    </>
  );

  return (
    <motion.li
      whileHover={reducedMotion ? undefined : { x: 4 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      {item.kind === 'internal' ? (
        <Link
          href={item.href}
          className="group flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {content}
        </Link>
      ) : (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {content}
        </a>
      )}
    </motion.li>
  );
}
