'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { NavigationTree } from '@/features/navigation/components/NavigationTree';
import { NavigationTreeDataProvider } from '@/features/navigation/components/NavigationTreeDataProvider';
import { MobileNavDrawer } from '@/components/ui/MobileNavDrawer';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { AmbientCursorGlow } from '@/components/ui/AmbientCursorGlow';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { FolderTree } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((o) => !o), []);
  const t = useTranslations('sidebar');
  const tHome = useTranslations('home');

  return (
    <NavigationTreeDataProvider>
      <div className="isolate flex min-h-screen flex-col">
        <AmbientBackground />
        <AmbientCursorGlow />
        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader mobileNavOpen={drawerOpen} onMobileNavToggle={toggleDrawer} />
          <div className="flex min-h-0 flex-1">
            <aside className="relative hidden w-72 shrink-0 border-r border-border/45 bg-gradient-to-b from-background/50 via-background/38 to-background/28 shadow-[inset_-1px_0_0_0_color-mix(in_oklab,var(--color-primary)_8%,transparent)] backdrop-blur-2xl supports-[backdrop-filter]:from-background/40 xl:block">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
                aria-hidden
              />
              <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
                <div className="relative shrink-0 overflow-hidden border-b border-border/45 bg-gradient-to-br from-primary/[0.1] via-background/45 to-accent/[0.06] px-4 py-3.5 shadow-[inset_0_-1px_0_0_color-mix(in_oklab,white_35%,transparent)] backdrop-blur-md dark:shadow-[inset_0_-1px_0_0_color-mix(in_oklab,white_6%,transparent)]">
                  <div
                    className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-primary/[0.14] blur-2xl"
                    aria-hidden
                  />
                  <div className="relative flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/12 text-primary shadow-md shadow-primary/10 ring-1 ring-primary/15">
                      <FolderTree className="h-[1.05rem] w-[1.05rem]" strokeWidth={2} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[0.65rem] font-bold uppercase leading-tight tracking-[0.16em] text-primary">
                        {t('topicTree')}
                      </p>
                      <p className="mt-0.5 truncate text-[0.7rem] text-muted-foreground">
                        {tHome('heroEyebrow')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative flex min-h-0 flex-1 flex-col px-2 pb-2 pt-1.5">
                  <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card/55 via-card/35 to-card/18 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.2),inset_0_1px_0_0_color-mix(in_oklab,white_45%,transparent)] backdrop-blur-md dark:from-card/30 dark:via-card/18 dark:to-card/10 dark:shadow-[0_12px_40px_-24px_rgba(0,0,0,0.55)] dark:shadow-[inset_0_1px_0_0_color-mix(in_oklab,white_8%,transparent)]">
                    <div className="h-full max-h-full overflow-y-auto overflow-x-hidden">
                      <NavigationTree />
                    </div>
                  </div>
                </div>
              </div>
            </aside>
            <div className="flex min-w-0 flex-1 flex-col">
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          </div>
          <MobileNavDrawer isOpen={drawerOpen} onClose={closeDrawer} />
        </div>
      </div>
    </NavigationTreeDataProvider>
  );
}
