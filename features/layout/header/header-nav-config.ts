import { FOOTER_EXPLORE_LINKS } from '@/features/layout/footer/footer-config';
import { BookOpen, Home, Info, Newspaper, Search } from 'lucide-react';

const MAIN_NAV_ICONS = [Home, Newspaper, BookOpen, Info, Search] as const;

/** Primary routes — aligned with `FOOTER_EXPLORE_LINKS` (single source of paths + nav keys). */
export const HEADER_MAIN_NAV = FOOTER_EXPLORE_LINKS.map((item, index) => ({
  href: item.href,
  navKey: item.navKey,
  Icon: MAIN_NAV_ICONS[index]!,
})) as ReadonlyArray<{
  href: (typeof FOOTER_EXPLORE_LINKS)[number]['href'];
  navKey: (typeof FOOTER_EXPLORE_LINKS)[number]['navKey'];
  Icon: (typeof MAIN_NAV_ICONS)[number];
}>;
