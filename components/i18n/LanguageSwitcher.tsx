'use client';

import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('language');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setLocale = (next: (typeof routing.locales)[number]) => {
    if (next === locale) return;
    const qs = searchParams.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    router.replace(href, { locale: next, scroll: false });
  };

  return (
    <div
      className="relative flex rounded-full border border-border bg-muted/40 p-0.5 text-xs font-medium"
      role="group"
      aria-label={t('switchLabel')}
    >
      <motion.span
        layout
        layoutId="lang-switch-indicator"
        className="absolute inset-y-0.5 rounded-full bg-background shadow-sm"
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        style={{
          width: 'calc(50% - 2px)',
          left: locale === 'vi' ? '2px' : 'calc(50%)',
        }}
      />
      {(routing.locales as readonly string[]).map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => setLocale(loc as (typeof routing.locales)[number])}
            className={`relative z-[1] min-w-[2.75rem] rounded-full px-2 py-1 transition-colors cursor-pointer ${
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-pressed={active}
            aria-label={loc === 'vi' ? t('vietnamese') : t('english')}
          >
            <motion.span
              key={loc + locale}
              initial={{ opacity: 0.45, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-block uppercase tracking-wide"
            >
              {loc === 'vi' ? 'VI' : 'EN'}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}
