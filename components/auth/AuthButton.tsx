'use client';

import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useSupabaseAuth } from '@/features/comments/hooks/useSupabaseAuth';
import { useTranslations } from 'next-intl';

export function AuthButton() {
  const t = useTranslations('auth');
  const { user, status } = useSupabaseAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (status === 'loading') {
    return <span className="h-9 w-20 rounded-md bg-muted animate-pulse inline-block" aria-hidden />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline max-w-[140px] truncate text-sm text-muted-foreground">
          {(typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
            user.email}
        </span>
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
          {signingOut ? t('session.signingOut') : t('session.signOut')}
        </button>
      </div>
    );
  }

  return (
    <Link
      href={'/auth/sign-in' as Route}
      className="cursor-pointer rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      {t('signIn.submit')}
    </Link>
  );
}
