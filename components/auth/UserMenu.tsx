'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase/client';
import { getUserAvatarUrl } from '@/lib/auth/user-avatar-url';
import { useSupabaseAuth } from '@/features/comments/hooks/useSupabaseAuth';
import { useAdminRole } from '@/features/auth/hooks/useAdminRole';
import { Link } from '@/i18n/navigation';

/**
 * UserMenu - Only shows when user is logged in.
 * Avatar opens a menu with name, admin (if editor), checklog & integrations (admin only), and sign out.
 */
export function UserMenu() {
  const { user, status } = useSupabaseAuth();
  const { isEditor, role } = useAdminRole();
  const t = useTranslations('auth.session');
  const tFooter = useTranslations('footer');
  const tAdmin = useTranslations('admin');
  const [signingOut, setSigningOut] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

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
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('userMenuOpen')}
        className="cursor-pointer rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={32}
              height={32}
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-xs font-semibold text-primary">{initials}</span>
          )}
        </div>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-[12rem] rounded-xl border border-border bg-card py-1 shadow-lg"
        >
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
          </div>
          {isEditor ? (
            <Link
              href="/admin/posts"
              role="menuitem"
              className="block px-3 py-2 text-sm text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {tFooter('admin')}
            </Link>
          ) : null}
          {role === 'admin' ? (
            <Link
              href="/checklog"
              role="menuitem"
              className="block px-3 py-2 text-sm text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {tAdmin('sidebar.checklog')}
            </Link>
          ) : null}
          {role === 'admin' ? (
            <Link
              href="/integrations"
              role="menuitem"
              className="block px-3 py-2 text-sm text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {tAdmin('sidebar.integrations')}
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            disabled={signingOut}
            onClick={async () => {
              setSigningOut(true);
              try {
                await fetch('/api/checklog/session-event', {
                  method: 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'signout' }),
                });
              } catch {
                /* best-effort audit */
              }
              await supabase.auth.signOut();
              setSigningOut(false);
              setOpen(false);
            }}
            className="w-full cursor-pointer px-3 py-2 text-left text-sm text-foreground hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
          >
            {signingOut ? t('signingOut') : t('signOut')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
