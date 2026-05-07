'use client';

import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export function useSupabaseAuth(): {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
} {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let mounted = true;

    const setFromSession = (nextSession: Session | null) => {
      if (!mounted) return;
      setSession(nextSession);
      setStatus(nextSession?.user ? 'authenticated' : 'unauthenticated');
    };

    supabase.auth
      .getSession()
      .then(({ data }) => setFromSession(data.session))
      .catch(() => setFromSession(null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setFromSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { status, session, user: session?.user ?? null };
}
