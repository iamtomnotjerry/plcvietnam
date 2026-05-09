'use client';

import { Suspense } from 'react';
import { SearchInput } from '@/features/search/components/SearchInput';
import { MobileSearchOverlay } from '@/components/ui/MobileSearchOverlay';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { AdminHeaderLink } from '@/features/cms/components/AdminHeaderLink';
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
        className="relative border-b border-border/70 bg-background/80 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.12),0_1px_0_0_color-mix(in_oklab,var(--color-primary)_8%,transparent)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/65 dark:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45)]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-80" />
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
            <AdminHeaderLink />
          </div>
        </div>
      </div>

      <HeaderMobileNavRail />
    </header>
  );
}
