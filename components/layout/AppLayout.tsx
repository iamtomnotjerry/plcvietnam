'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { NavigationTree } from '@/features/navigation/components/NavigationTree';
import { MobileNavDrawer } from '@/components/ui/MobileNavDrawer';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { AmbientCursorGlow } from '@/components/ui/AmbientCursorGlow';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((o) => !o), []);
  const t = useTranslations('sidebar');

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <AmbientBackground />
      <AmbientCursorGlow />
      <SiteHeader mobileNavOpen={drawerOpen} onMobileNavToggle={toggleDrawer} />
      <div className="flex flex-1">
        {/* Sticky sidebar — stays fixed while page content scrolls */}
        <aside className="hidden xl:block w-72 shrink-0 border-r border-border bg-muted/20">
          <div className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border/80 bg-background/95 backdrop-blur-sm shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('topicTree')}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavigationTree />
            </div>
          </div>
        </aside>
        <div className="flex-1 min-w-0 flex flex-col">
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </div>
      <MobileNavDrawer isOpen={drawerOpen} onClose={closeDrawer} />
    </div>
  );
}
