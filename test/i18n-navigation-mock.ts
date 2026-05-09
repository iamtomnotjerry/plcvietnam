/**
 * Vitest: mock `@/i18n/navigation` so components using next-intl Link/router
 * do not need `NextIntlClientProvider` or full `next/navigation` exports.
 */
import * as React from 'react';
import { vi } from 'vitest';

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

/** Mutable mocks for tests that need to assert on pathname / router. */
export const i18nNavMocks = {
  mockRouter,
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => mockRouter),
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
};

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: { href: string; children?: React.ReactNode }) =>
    React.createElement('a', { href: String(href), ...(rest as object) }, children),
  usePathname: () => i18nNavMocks.usePathname(),
  useRouter: () => i18nNavMocks.useRouter(),
  redirect: i18nNavMocks.redirect,
  permanentRedirect: i18nNavMocks.permanentRedirect,
  getPathname: (pathname: string) => pathname,
}));
