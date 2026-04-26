import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Route } from 'next';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:gap-10">
        <aside className="shrink-0 md:w-52">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              CMS (demo)
            </p>
            <nav className="flex flex-col gap-1 text-sm">
              <Link
                href={'/admin/posts' as Route}
                className="rounded-md px-3 py-2 font-medium text-foreground hover:bg-muted"
              >
                Bài viết
              </Link>
              <Link
                href={'/admin/posts/new' as Route}
                className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Viết bài mới
              </Link>
              <Link
                href={'/admin/about/edit' as Route}
                className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Chỉnh sửa Giới thiệu
              </Link>
              <Link
                href={'/admin/books' as Route}
                className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Quản lý Sách
              </Link>
              <Link
                href={'/' as Route}
                className="mt-4 rounded-md px-3 py-2 text-muted-foreground hover:underline"
              >
                ← Về site
              </Link>
            </nav>
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
