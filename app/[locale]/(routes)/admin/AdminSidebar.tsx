'use client';

import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import type { Route } from 'next';
import { useTranslations } from 'next-intl';

export function AdminSidebar() {
  const t = useTranslations('admin');
  const pathname = usePathname();

  const navItems = [
    {
      groupKey: 'groupContent' as const,
      links: [
        { href: '/admin/posts', labelKey: 'posts' as const },
        { href: '/admin/posts/new', labelKey: 'newPost' as const },
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
    // Exact match for /admin/posts/new, otherwise prefix match
    if (href === '/admin/posts') {
      return pathname === '/admin/posts' || /^\/admin\/posts\/[^/]+\/edit/.test(pathname);
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="shrink-0 md:w-52">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('sidebar.cms')}
        </p>
        <nav className="flex flex-col gap-1 text-sm">
          {navItems.map((section) => (
            <div key={section.groupKey}>
              <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground/60">
                {t(`sidebar.${section.groupKey}`)}
              </p>
              {section.links.map(({ href, labelKey }) => (
                <Link
                  key={href}
                  href={href as Route}
                  className={`block rounded-md px-3 py-2 transition-colors ${
                    isActive(href)
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {t(`sidebar.${labelKey}`)}
                </Link>
              ))}
            </div>
          ))}

          <Link
            href={'/' as Route}
            className="mt-4 block rounded-md px-3 py-2 text-muted-foreground hover:underline"
          >
            {t('sidebar.backToSite')}
          </Link>
        </nav>
      </div>
    </aside>
  );
}
