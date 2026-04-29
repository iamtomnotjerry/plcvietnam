'use client';

import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

/**
 * UserMenu - Only shows when user is logged in
 * Displays user name and sign out button
 */
export function UserMenu() {
  const { data: session, status } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  // Don't show anything if not logged in
  if (status === 'loading') {
    return null;
  }

  if (!session?.user) {
    return null;
  }

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
