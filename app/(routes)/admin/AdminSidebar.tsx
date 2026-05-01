'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';

const navItems = [
  {
    group: 'Nội dung',
    links: [
      { href: '/admin/posts', label: 'Bài viết' },
      { href: '/admin/posts/new', label: 'Viết bài mới' },
      { href: '/admin/books', label: 'Quản lý Sách' },
    ],
  },
  {
    group: 'Phân loại',
    links: [
      { href: '/admin/fields', label: 'Lĩnh vực' },
      { href: '/admin/categories', label: 'Danh mục' },
      { href: '/admin/tags', label: 'Thẻ (Tags)' },
      { href: '/admin/reorder', label: 'Sắp xếp thứ tự' },
    ],
  },
  {
    group: 'Khác',
    links: [{ href: '/admin/about/edit', label: 'Chỉnh sửa Giới thiệu' }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
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
          CMS
        </p>
        <nav className="flex flex-col gap-1 text-sm">
          {navItems.map((section) => (
            <div key={section.group}>
              <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground/60">
                {section.group}
              </p>
              {section.links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href as Route}
                  className={`block rounded-md px-3 py-2 transition-colors ${
                    isActive(href)
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          ))}

          <Link
            href={'/' as Route}
            className="mt-4 block rounded-md px-3 py-2 text-muted-foreground hover:underline"
          >
            ← Về site
          </Link>
        </nav>
      </div>
    </aside>
  );
}
