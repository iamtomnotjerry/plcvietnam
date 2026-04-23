'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { signOut, useSession } from 'next-auth/react';

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <span className="h-9 w-20 rounded-md bg-muted animate-pulse inline-block" aria-hidden />
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline max-w-[140px] truncate text-sm text-muted-foreground">
          {session.user.name ?? session.user.email}
        </span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <Link
      href={'/auth/sign-in' as Route}
      className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      Đăng nhập
    </Link>
  );
}
