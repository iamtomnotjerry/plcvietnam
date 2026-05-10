'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { Building2, LayoutDashboard, LogOut, Plug, ScrollText, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { getUserAvatarUrl } from '@/lib/auth/user-avatar-url';
import { useSupabaseAuth } from '@/features/comments/hooks/useSupabaseAuth';
import { useAdminRole } from '@/features/auth/hooks/useAdminRole';
import { Link } from '@/i18n/navigation';
import { motionEaseOut, motionDuration } from '@/lib/ui/motion';

const menuContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
};

const menuItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: motionDuration.fast, ease: motionEaseOut },
  },
};

const menuItemClass =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground outline-none transition-[transform,background-color,color] duration-200 hover:bg-primary/10 hover:text-primary focus-visible:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card enabled:active:scale-[0.98]';

/**
 * UserMenu - Only shows when user is logged in.
 * Avatar opens a menu with name, admin (if editor), checklog, integrations & architecture (admin only), and sign out.
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
  const reduceMotion = useReducedMotion();

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

  const panelInitial = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: -14, scale: 0.9, rotateX: -8 };
  const panelAnimate = reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, rotateX: 0 };
  const panelExit = reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96, rotateX: -4 };
  const panelTransition = reduceMotion
    ? { duration: 0.15 }
    : ({ type: 'spring', stiffness: 420, damping: 28, mass: 0.85 } as const);

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t('userMenuOpen')}
        whileHover={reduceMotion ? undefined : { scale: 1.06 }}
        whileTap={reduceMotion ? undefined : { scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 480, damping: 22 }}
        className={[
          'relative cursor-pointer rounded-full p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          open
            ? 'bg-gradient-to-br from-primary/45 via-primary/25 to-accent/35 shadow-[0_0_24px_-4px_color-mix(in_oklab,var(--color-primary)_55%,transparent)]'
            : 'bg-gradient-to-br from-primary/20 via-transparent to-accent/15 hover:from-primary/30 hover:to-accent/25',
        ].join(' ')}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className={[
            'relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-background shadow-inner ring-1 ring-black/[0.06] dark:ring-white/[0.08]',
            open ? 'ring-2 ring-primary/40' : '',
          ].join(' ')}
        >
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
        {!reduceMotion ? (
          <motion.span
            className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[7px] font-bold text-primary-foreground shadow-sm"
            animate={open ? { scale: [1, 1.15, 1], rotate: [0, 8, 0] } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.45, ease: motionEaseOut }}
            aria-hidden
          >
            <Sparkles className="h-2 w-2" strokeWidth={2.5} />
          </motion.span>
        ) : null}
      </motion.button>

      <AnimatePresence>
        {open ? (
          <div
            className="absolute right-0 top-full z-50 pt-2"
            style={{ perspective: reduceMotion ? undefined : '1100px' }}
          >
            <motion.div
              role="menu"
              initial={panelInitial}
              animate={panelAnimate}
              exit={panelExit}
              transition={panelTransition}
              style={{ transformStyle: 'preserve-3d', transformOrigin: 'top right' }}
              className="min-w-[15rem] overflow-hidden rounded-2xl border border-border/70 bg-card/92 shadow-[0_28px_56px_-16px_rgba(0,0,0,0.35),0_0_0_1px_color-mix(in_oklab,var(--color-primary)_12%,transparent),inset_0_1px_0_0_color-mix(in_oklab,white_22%,transparent)] backdrop-blur-xl dark:bg-card/88 dark:shadow-[0_28px_56px_-16px_rgba(0,0,0,0.65),inset_0_1px_0_0_color-mix(in_oklab,white_8%,transparent)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-accent/[0.08]" />
              <div className="relative border-b border-border/60 bg-gradient-to-r from-muted/40 via-transparent to-muted/30 px-3.5 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 shadow-md ring-1 ring-primary/15">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt=""
                        width={44}
                        height={44}
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-sm font-bold text-primary">{initials}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold tracking-tight text-foreground">
                      {displayName}
                    </p>
                    {user.email && user.email !== displayName ? (
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <motion.div
                className="relative space-y-0.5 p-1.5"
                variants={menuContainerVariants}
                initial="hidden"
                animate="show"
              >
                {isEditor ? (
                  <motion.div variants={menuItemVariants}>
                    <Link
                      href="/admin/posts"
                      role="menuitem"
                      className={menuItemClass}
                      onClick={() => setOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 shrink-0 text-primary/90" aria-hidden />
                      {tFooter('admin')}
                    </Link>
                  </motion.div>
                ) : null}
                {role === 'admin' ? (
                  <motion.div variants={menuItemVariants}>
                    <Link
                      href="/checklog"
                      role="menuitem"
                      className={menuItemClass}
                      onClick={() => setOpen(false)}
                    >
                      <ScrollText className="h-4 w-4 shrink-0 text-primary/90" aria-hidden />
                      {tAdmin('sidebar.checklog')}
                    </Link>
                  </motion.div>
                ) : null}
                {role === 'admin' ? (
                  <motion.div variants={menuItemVariants}>
                    <Link
                      href="/integrations"
                      role="menuitem"
                      className={menuItemClass}
                      onClick={() => setOpen(false)}
                    >
                      <Plug className="h-4 w-4 shrink-0 text-primary/90" aria-hidden />
                      {tAdmin('sidebar.integrations')}
                    </Link>
                  </motion.div>
                ) : null}
                {role === 'admin' ? (
                  <motion.div variants={menuItemVariants}>
                    <Link
                      href="/architecture"
                      role="menuitem"
                      className={menuItemClass}
                      onClick={() => setOpen(false)}
                    >
                      <Building2 className="h-4 w-4 shrink-0 text-primary/90" aria-hidden />
                      {tAdmin('sidebar.architecture')}
                    </Link>
                  </motion.div>
                ) : null}

                <div className="my-1.5 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                <motion.div variants={menuItemVariants}>
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
                    className={`${menuItemClass} text-left hover:bg-destructive/12 hover:text-destructive`}
                  >
                    <LogOut className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                    {signingOut ? t('signingOut') : t('signOut')}
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
