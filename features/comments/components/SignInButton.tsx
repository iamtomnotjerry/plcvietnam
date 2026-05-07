/**
 * SignInButton — session chip for comment area; sign-in goes to /auth/sign-in
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { supabase } from '@/lib/supabase/client';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export function SignInButton() {
  const { user, status } = useSupabaseAuth();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3 animate-pulse" aria-label="Đang tải...">
        <div className="w-9 h-9 rounded-full bg-muted" />
        <div className="h-4 w-28 rounded bg-muted" />
      </div>
    );
  }

  if (status === 'authenticated' && user) {
    const name = user.user_metadata?.full_name ?? user.email ?? 'User';
    const image = (user.user_metadata?.avatar_url as string | undefined) ?? undefined;

    return (
      <div className="flex items-center gap-3">
        {image ? (
          <Image
            src={image}
            alt={name ?? 'Avatar'}
            width={36}
            height={36}
            className="rounded-full object-cover ring-2 ring-primary/20"
          />
        ) : (
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
            aria-hidden="true"
          >
            {name?.charAt(0).toUpperCase() ?? '?'}
          </div>
        )}

        <span className="text-sm font-medium text-card-foreground">{name}</span>

        <button
          type="button"
          onClick={() => {
            void supabase.auth.signOut();
          }}
          className="cursor-pointer text-sm text-muted-foreground underline-offset-2 transition-colors hover:text-destructive hover:underline"
          aria-label="Đăng xuất khỏi tài khoản"
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <Link
      href={'/auth/sign-in' as Route}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground shadow-sm transition-colors hover:bg-muted"
    >
      Đăng nhập để bình luận
    </Link>
  );
}
