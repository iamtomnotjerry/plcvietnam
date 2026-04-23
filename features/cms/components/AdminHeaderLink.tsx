'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useSession } from 'next-auth/react';

export function AdminHeaderLink() {
  const { data } = useSession();
  const role = data?.user?.role;
  if (role !== 'admin' && role !== 'editor') return null;
  return (
    <Link
      href={'/admin/posts' as Route}
      className="hidden rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-block"
    >
      Quản trị
    </Link>
  );
}
