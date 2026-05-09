import '@testing-library/jest-dom';
import { vi } from 'vitest';
import type { ReactNode } from 'react';

// Register i18n navigation mock before any SUT imports `@/i18n/navigation`.
import './test/i18n-navigation-mock';

import viMessagesBase from './messages/vi.json';
import adminVi from './messages/admin/vi.json';
import pagesVi from './messages/pages/vi.json';
import legalVi from './messages/legal/vi.json';
import viAbout01 from './messages/about/vi/01.json';
import viAbout02 from './messages/about/vi/02.json';
import viAbout03 from './messages/about/vi/03.json';
import viAbout04 from './messages/about/vi/04.json';
import viAbout05 from './messages/about/vi/05.json';
import viAbout06 from './messages/about/vi/06.json';
import viAbout07 from './messages/about/vi/07.json';
import viAbout08 from './messages/about/vi/08.json';
import viAbout09 from './messages/about/vi/09.json';

type Messages = Record<string, unknown>;

const viAboutMerged: Messages = {
  ...viAbout01,
  ...viAbout02,
  ...viAbout03,
  ...viAbout04,
  ...viAbout05,
  ...viAbout06,
  ...viAbout07,
  ...viAbout08,
  ...viAbout09,
};

const viMessages: Messages = {
  ...(viMessagesBase as Messages),
  ...(adminVi as Messages),
  ...(pagesVi as Messages),
  ...(legalVi as Messages),
  aboutPage: {
    ...(((viMessagesBase as Messages).aboutPage as Messages) ?? {}),
    ...viAboutMerged,
  },
};

function buildIntlMocks(messages: Messages) {
  function getNested(obj: unknown, path: string): unknown {
    return path
      .split('.')
      .reduce(
        (current, segment) =>
          current && typeof current === 'object' && segment in current
            ? (current as Record<string, unknown>)[segment]
            : undefined,
        obj
      );
  }

  function applyICU(template: string, values?: Record<string, unknown>): string {
    if (!values) return template;
    let out = template;
    for (const [k, v] of Object.entries(values)) {
      out = out.split(`{${k}}`).join(String(v));
    }
    return out;
  }

  function lookupRaw(namespace: string | undefined, key: string): unknown {
    if (namespace) {
      const nsRoot = getNested(messages, namespace);
      if (nsRoot == null) return undefined;
      if (typeof nsRoot === 'object' && key.includes('.')) {
        return getNested(nsRoot, key);
      }
      if (typeof nsRoot === 'object' && key in (nsRoot as object)) {
        return (nsRoot as Record<string, unknown>)[key];
      }
      return undefined;
    }
    return getNested(messages, key);
  }

  function createTranslator(namespace?: string) {
    const translate = (key: string, values?: Record<string, unknown>) => {
      const raw = lookupRaw(namespace, key);
      if (typeof raw === 'string') {
        return applyICU(raw, values);
      }
      if (raw != null && raw !== '') {
        return applyICU(String(raw), values);
      }
      return key;
    };
    translate.raw = (key: string) => lookupRaw(namespace, key);
    return translate;
  }

  return { createTranslator };
}

vi.mock('next-intl', async () => {
  const messages = viMessages;
  const { createTranslator } = buildIntlMocks(messages);
  return {
    useTranslations: (namespace?: string) => createTranslator(namespace),
    useLocale: () => 'vi',
    useFormatter: () => ({
      dateTime: (d: Date) => d.toISOString(),
      number: (n: number) => String(n),
      relativeTime: () => '',
    }),
    NextIntlClientProvider: ({ children }: { children: ReactNode }) => children,
  };
});

vi.mock('next-intl/server', async () => {
  const messages = viMessages;
  const { createTranslator } = buildIntlMocks(messages);
  return {
    getTranslations: async (arg?: unknown) => {
      let namespace: string | undefined;
      if (typeof arg === 'string') namespace = arg;
      else if (arg && typeof arg === 'object' && arg !== null && 'namespace' in arg) {
        namespace = (arg as { namespace?: string }).namespace;
      }
      return createTranslator(namespace);
    },
    getLocale: async () => 'vi',
    setRequestLocale: vi.fn(),
    getMessages: async () => messages,
  };
});

global.IntersectionObserver = class IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Mock Supabase globally - prevents "supabaseUrl is required" in tests
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn().mockResolvedValue({ error: null }),
      setSession: vi.fn().mockResolvedValue({ error: null }),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file.jpg' } })),
        remove: vi.fn().mockResolvedValue({ error: null }),
      })),
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
}));

// Mock Supabase realtime
vi.mock('@/lib/supabase/realtime', () => ({
  subscribeToComments: vi.fn(() => () => {}),
}));
