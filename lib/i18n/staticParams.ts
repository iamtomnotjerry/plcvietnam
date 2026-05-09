import { routing } from '@/i18n/routing';

export function withLocales<T extends Record<string, unknown>>(
  items: T[]
): Array<T & { locale: string }> {
  return routing.locales.flatMap((locale) => items.map((item) => ({ ...item, locale })));
}
