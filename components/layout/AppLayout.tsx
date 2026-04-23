'use client';

import { useState, useCallback } from 'react';
import { NavigationTree } from '@/features/navigation/components/NavigationTree';
import { MobileNavDrawer } from '@/components/ui/MobileNavDrawer';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((o) => !o), []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader mobileNavOpen={drawerOpen} onMobileNavToggle={toggleDrawer} />
      <div className="flex flex-1 min-h-0">
        <aside className="hidden xl:flex w-72 shrink-0 flex-col border-r border-border bg-muted/20 overflow-y-auto">
          <div className="sticky top-0 p-4 border-b border-border/80 bg-background/95 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Cây chủ đề
            </p>
          </div>
          <NavigationTree />
        </aside>
        <main className="flex-1 min-w-0 overflow-y-auto flex flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </main>
      </div>
      <MobileNavDrawer isOpen={drawerOpen} onClose={closeDrawer} />
    </div>
  );
}
