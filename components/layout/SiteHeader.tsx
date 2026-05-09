'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { SearchInput } from '@/features/search/components/SearchInput';
import { MobileSearchOverlay } from '@/components/ui/MobileSearchOverlay';
import { HamburgerButton } from '@/components/ui/HamburgerButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AdminHeaderLink } from '@/features/cms/components/AdminHeaderLink';
import { UserMenu } from '@/components/auth/UserMenu';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { Link, usePathname } from '@/i18n/navigation';

const navHrefs = ['/', '/posts', '/books', '/about', '/search'] as const;

interface SiteHeaderProps {
  mobileNavOpen?: boolean;
  onMobileNavToggle?: () => void;
}

export function SiteHeader({ mobileNavOpen = false, onMobileNavToggle }: SiteHeaderProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const tSite = useTranslations('site');

  const navLabels = [t('home'), t('posts'), t('books'), t('about'), t('search')] as const;

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        {onMobileNavToggle && (
          <div className="xl:hidden shrink-0">
            <HamburgerButton isOpen={mobileNavOpen} onClick={onMobileNavToggle} />
          </div>
        )}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-serif text-lg font-semibold tracking-tight text-foreground hover:text-primary transition-colors"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden bg-primary">
            <Image
              src="/logo.jpg"
              alt={tSite('logoAlt')}
              width={32}
              height={32}
              className="object-cover w-full h-full"
            />
          </span>
          <span className="hidden sm:inline">{tSite('brand')}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label={t('mainLabel')}>
          {navHrefs.map((href, i) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {navLabels[i]}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block flex-1 max-w-md min-w-0 pl-2">
          <SearchInput variant="navbar" />
        </div>

        <div className="flex flex-1 md:flex-none items-center justify-end gap-2">
          <div className="md:hidden">
            <MobileSearchOverlay />
          </div>
          <Suspense
            fallback={
              <div
                className="h-7 w-[5.75rem] shrink-0 rounded-full border border-border bg-muted/40"
                aria-hidden
              />
            }
          >
            <LanguageSwitcher />
          </Suspense>
          <ThemeToggle />
          <UserMenu />
          <AdminHeaderLink />
        </div>
      </div>

      <nav
        className="flex lg:hidden gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 scrollbar-none"
        aria-label={t('mainLabel')}
      >
        {navHrefs.map((href, i) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {navLabels[i]}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
