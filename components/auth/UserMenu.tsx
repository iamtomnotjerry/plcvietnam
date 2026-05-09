'use client';

import { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { getUserAvatarUrl } from '@/lib/auth/user-avatar-url';
import { useSupabaseAuth } from '@/features/comments/hooks/useSupabaseAuth';

/**
 * UserMenu - Only shows when user is logged in
 * Displays user avatar, name and sign out button
 */
export function UserMenu() {
  const { user, status } = useSupabaseAuth();
  const [signingOut, setSigningOut] = useState(false);

  // Don't show anything if not logged in
  if (status === 'loading') {
    return null;
  }

  if (!user) {
    return null;
  }

  const displayName =
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === 'string' && user.user_metadata.name) ||
    user.email ||
    'User';
  const avatarUrl = getUserAvatarUrl(user);
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
        {avatarUrl ? (
          <Image
            src={avatarUrl}
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
          await supabase.auth.signOut();
          setSigningOut(false);
        }}
        className="cursor-pointer rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {signingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
      </button>
    </div>
  );
}
