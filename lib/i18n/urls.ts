import { routing } from '@/i18n/routing';

/**
 * Infer active locale from the URL path (first segment when it matches a configured locale).
 * Used for locale-aware redirects outside of next-intl request context (e.g. admin gate).
 */
export function localeFromPathname(pathname: string): string {
  const first = pathname.split('/').filter(Boolean)[0];
  if (first && (routing.locales as readonly string[]).includes(first)) {
    return first;
  }
  return routing.defaultLocale;
}

/** Path with locale prefix for `localePrefix: 'as-needed'` (default locale has no prefix). */
export function pathForLocale(locale: string, pathname: string): string {
  const p = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (locale === routing.defaultLocale) {
    return p;
  }
  if (p === '/') {
    return `/${locale}`;
  }
  return `/${locale}${p}`;
}

export function absoluteUrlForLocale(locale: string, pathname: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '');
  const path = pathForLocale(locale, pathname);
  if (path === '/') {
    return base;
  }
  return `${base}${path}`;
}

export function metadataLanguageAlternates(pathname: string, baseUrl: string) {
  return {
    languages: Object.fromEntries(
      routing.locales.map((locale) => [locale, absoluteUrlForLocale(locale, pathname, baseUrl)])
    ),
  };
}
