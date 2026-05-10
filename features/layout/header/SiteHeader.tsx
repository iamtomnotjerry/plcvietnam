'use client';

import { Suspense } from 'react';
import { SearchInput } from '@/features/search/components/SearchInput';
import { MobileSearchOverlay } from '@/components/ui/MobileSearchOverlay';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { HeaderBrand } from '@/features/layout/header/HeaderBrand';
import { HeaderDesktopNav } from '@/features/layout/header/HeaderDesktopNav';
import { HeaderMenuButton } from '@/features/layout/header/HeaderMenuButton';
import { HeaderMobileNavRail } from '@/features/layout/header/HeaderMobileNavRail';

interface SiteHeaderProps {
  mobileNavOpen?: boolean;
  onMobileNavToggle?: () => void;
}

export function SiteHeader({ mobileNavOpen = false, onMobileNavToggle }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
      <div
        className="relative border-b border-border/60 bg-background/75 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.1),0_1px_0_0_color-mix(in_oklab,var(--color-primary)_10%,transparent),inset_0_1px_0_0_color-mix(in_oklab,white_40%,transparent)] backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/58 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45),inset_0_1px_0_0_color-mix(in_oklab,white_6%,transparent)]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-accent/[0.05]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/90 to-transparent opacity-90" />
        <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          {onMobileNavToggle && (
            <div className="shrink-0 xl:hidden">
              <HeaderMenuButton isOpen={mobileNavOpen} onClick={onMobileNavToggle} />
            </div>
          )}

          <HeaderBrand />

          <HeaderDesktopNav />

          <div className="hidden min-w-0 max-w-md flex-1 pl-2 md:block">
            <SearchInput variant="navbar" />
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
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
          </div>
        </div>
      </div>

      <HeaderMobileNavRail />
    </header>
  );
}
