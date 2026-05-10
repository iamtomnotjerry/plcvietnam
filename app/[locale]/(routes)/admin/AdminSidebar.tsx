'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import type { Route } from 'next';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  BookOpen,
  FolderTree,
  GripVertical,
  Menu,
  Network,
  Newspaper,
  Plug,
  ScrollText,
  Shapes,
  Tags,
  UserCircle,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const linkIcon = (href: string): LucideIcon => {
  const map: Record<string, LucideIcon> = {
    '/admin/posts': Newspaper,
    '/admin/books': BookOpen,
    '/admin/fields': Shapes,
    '/admin/categories': FolderTree,
    '/admin/tags': Tags,
    '/admin/reorder': GripVertical,
    '/checklog': ScrollText,
    '/integrations': Plug,
    '/architecture': Network,
    '/admin/about/edit': UserCircle,
  };
  return map[href] ?? Newspaper;
};

export function AdminSidebar() {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const navItems = [
    {
      groupKey: 'groupContent' as const,
      links: [
        { href: '/admin/posts', labelKey: 'posts' as const },
        { href: '/admin/books', labelKey: 'books' as const },
      ],
    },
    {
      groupKey: 'groupTaxonomy' as const,
      links: [
        { href: '/admin/fields', labelKey: 'fields' as const },
        { href: '/admin/categories', labelKey: 'categories' as const },
        { href: '/admin/tags', labelKey: 'tags' as const },
        { href: '/admin/reorder', labelKey: 'reorder' as const },
      ],
    },
    {
      groupKey: 'groupOther' as const,
      links: [
        { href: '/checklog', labelKey: 'checklog' as const },
        { href: '/integrations', labelKey: 'integrations' as const },
        { href: '/architecture', labelKey: 'architecture' as const },
        { href: '/admin/about/edit', labelKey: 'aboutEdit' as const },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/checklog') {
      return (
        pathname === '/checklog' ||
        pathname.startsWith('/checklog/') ||
        pathname.startsWith('/en/checklog')
      );
    }
    if (href === '/integrations') {
      return (
        pathname === '/integrations' ||
        pathname.startsWith('/integrations/') ||
        pathname.startsWith('/en/integrations')
      );
    }
    if (href === '/architecture') {
      return (
        pathname === '/architecture' ||
        pathname.startsWith('/architecture/') ||
        pathname.startsWith('/en/architecture')
      );
    }
    if (href === '/admin/posts') {
      return pathname === '/admin/posts' || /^\/admin\/posts\/[^/]+\/edit/.test(pathname);
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) closeBtnRef.current?.focus();
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const NavLink = ({ href, labelKey }: { href: string; labelKey: string }) => {
    const active = isActive(href);
    const Icon = linkIcon(href);
    return (
      <Link
        href={href as Route}
        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
          active
            ? 'bg-primary/12 font-medium text-primary shadow-[inset_3px_0_0_0_var(--color-primary)]'
            : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
        }`}
      >
        <Icon
          className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}
          aria-hidden
        />
        <span className="truncate">{t(`sidebar.${labelKey}`)}</span>
      </Link>
    );
  };

  const navBody = (
    <nav className="flex flex-col gap-1 px-3 pb-4">
      {navItems.map((section) => (
        <div key={section.groupKey} className="pt-2">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {t(`sidebar.${section.groupKey}`)}
          </p>
          {section.links.map(({ href, labelKey }) => (
            <NavLink key={href} href={href} labelKey={labelKey} />
          ))}
        </div>
      ))}
      <Link
        href={'/' as Route}
        className="mx-3 mt-4 flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        {t('sidebar.backToSite')}
      </Link>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/80 bg-card/90 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('sidebar.cms')}
          </p>
          <p className="truncate text-sm font-medium text-foreground">PLC Việt Nam</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0"
          onClick={() => setMobileOpen(true)}
          aria-expanded={mobileOpen}
          aria-controls="admin-nav-drawer"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">{t('sidebar.openMenu')}</span>
        </Button>
      </div>

      <div
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200 md:hidden ${
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        id="admin-nav-drawer"
        aria-label={t('sidebar.cms')}
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[min(20rem,92vw)] flex-col border-r border-border bg-card shadow-xl
          max-md:transition-transform max-md:duration-200
          ${mobileOpen ? 'max-md:translate-x-0' : 'max-md:pointer-events-none max-md:-translate-x-full'}
          md:sticky md:top-0 md:max-h-screen md:z-0 md:h-screen md:w-64 md:shrink-0 md:translate-x-0 md:border-r md:border-border/60 md:bg-card/90 md:shadow-none md:backdrop-blur-xl md:pointer-events-auto
        `}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 md:block md:border-0 md:px-0 md:py-0">
          <div className="min-w-0 md:border-b md:border-border/50 md:px-5 md:py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground md:block">
              {t('sidebar.cms')}
            </p>
            <p className="truncate font-serif text-lg font-semibold tracking-tight text-foreground">
              PLC Việt Nam
            </p>
          </div>
          <Button
            ref={closeBtnRef}
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">{t('sidebar.closeMenu')}</span>
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain md:pt-2">{navBody}</div>
      </aside>
    </>
  );
}
