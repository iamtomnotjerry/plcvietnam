'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link, usePathname } from '@/i18n/navigation';
import { HEADER_MAIN_NAV } from '@/features/layout/header/header-nav-config';
import { headerSpringSnappy } from '@/features/layout/header/header-motion';

export function HeaderDesktopNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <nav className="hidden lg:flex" aria-label={t('mainLabel')}>
      <ul className="flex items-center gap-0.5 rounded-2xl border border-border/45 bg-background/50 p-1 shadow-inner shadow-black/[0.03] backdrop-blur-md dark:bg-background/25">
        {HEADER_MAIN_NAV.map(({ href, navKey, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <li key={href} className="relative">
              <Link
                href={href}
                prefetch
                className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-[color,transform] duration-200 hover:-translate-y-px active:translate-y-0 ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="header-main-nav-pill"
                    className="absolute inset-0 -z-10 rounded-xl border border-primary/20 bg-primary/12 shadow-[0_4px_20px_-4px_color-mix(in_oklab,var(--color-primary)_35%,transparent),inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                    transition={headerSpringSnappy}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} />
                <span className="relative z-10">{t(navKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
