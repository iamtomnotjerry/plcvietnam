'use client';

import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';

/**
 * UserMenu - Only shows when user is logged in
 * Displays user avatar, name and sign out button
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

  const user = session.user;
  const displayName = user.name ?? user.email ?? 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="relative h-8 w-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
        {user.image ? (
          <Image
            src={user.image}
            alt={displayName}
            width={32}
            height={32}
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="text-xs font-semibold text-primary">{initials}</span>
        )}
      </div>

      {/* Name */}
      <span className="hidden sm:inline max-w-[140px] truncate text-sm font-medium text-foreground">
        {displayName}
      </span>

      {/* Logout Button */}
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
