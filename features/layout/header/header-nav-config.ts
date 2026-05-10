import { FOOTER_EXPLORE_LINKS } from '@/features/layout/footer/footer-config';
import { BookOpen, Home, Info, Newspaper } from 'lucide-react';

/** Header omits `/search` — navbar already has `SearchInput` / mobile search (avoids duplicate search icons). */
const HEADER_LINK_ITEMS = FOOTER_EXPLORE_LINKS.filter((item) => item.href !== '/search');

const MAIN_NAV_ICONS = [Home, Newspaper, BookOpen, Info] as const;

/** Primary routes — subset of `FOOTER_EXPLORE_LINKS` (footer still lists Search). */
export const HEADER_MAIN_NAV = HEADER_LINK_ITEMS.map((item, index) => ({
  href: item.href,
  navKey: item.navKey,
  Icon: MAIN_NAV_ICONS[index]!,
})) as ReadonlyArray<{
  href: (typeof HEADER_LINK_ITEMS)[number]['href'];
  navKey: (typeof HEADER_LINK_ITEMS)[number]['navKey'];
  Icon: (typeof MAIN_NAV_ICONS)[number];
}>;
