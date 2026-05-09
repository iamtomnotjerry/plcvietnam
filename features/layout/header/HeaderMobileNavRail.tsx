'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link, usePathname } from '@/i18n/navigation';
import { HEADER_MAIN_NAV } from '@/features/layout/header/header-nav-config';
import { headerSpringSnappy } from '@/features/layout/header/header-motion';

export function HeaderMobileNavRail() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <nav
      className="flex gap-2 overflow-x-auto border-t border-border/50 bg-muted/20 px-3 py-2.5 scrollbar-none supports-[backdrop-filter]:backdrop-blur-md lg:hidden"
      aria-label={t('mainLabel')}
    >
      {HEADER_MAIN_NAV.map(({ href, navKey, Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            prefetch
            className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-[color,transform] active:scale-[0.98] ${
              active
                ? 'text-primary-foreground'
                : 'bg-muted/90 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {active && (
              <motion.span
                layoutId="header-mobile-nav-pill"
                className="absolute inset-0 -z-10 rounded-full bg-primary shadow-[0_3px_14px_-2px_color-mix(in_oklab,var(--color-primary)_50%,transparent)]"
                transition={headerSpringSnappy}
              />
            )}
            <Icon className="relative z-10 h-3.5 w-3.5" strokeWidth={2} />
            <span className="relative z-10">{t(navKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
