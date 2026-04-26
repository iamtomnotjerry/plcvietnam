'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export function AuthButton() {
  const { data: session, status } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  if (status === 'loading') {
    return <span className="h-9 w-20 rounded-md bg-muted animate-pulse inline-block" aria-hidden />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline max-w-[140px] truncate text-sm text-muted-foreground">
          {session.user.name ?? session.user.email}
        </span>
        <button
          type="button"
          disabled={signingOut}
          onClick={async () => {
            setSigningOut(true);
            await signOut({ callbackUrl: '/' });
          }}
          className="cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {signingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </button>
      </div>
    );
  }

  return (
    <Link
      href={'/auth/sign-in' as Route}
      className="cursor-pointer rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      Đăng nhập
    </Link>
  );
}
