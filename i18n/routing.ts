import { defineRouting } from 'next-intl/routing';

/**
 * VI: no prefix (/about). EN: /en/about.
 * next-intl middleware syncs locale cookie and can emit Link alternates for SEO (default on).
 */
export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'as-needed',
});
