'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useAdminRole } from '@/features/auth/hooks/useAdminRole';

export function AdminHeaderLink() {
  const { isEditor } = useAdminRole();
  if (!isEditor) return null;
  return (
    <Link
      href={'/admin/posts' as Route}
      className="hidden rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-block"
    >
      Quản trị
    </Link>
  );
}
