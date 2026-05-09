'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { EmailOtpType } from '@supabase/supabase-js';
import { useRouter } from '@/i18n/navigation';
import { supabase } from '@/lib/supabase/client';
import { resolveSafeCallbackPath } from '@/lib/auth/safe-callback';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth.callback');

  useEffect(() => {
    const next = resolveSafeCallbackPath(searchParams.get('next'));
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;

    let cancelled = false;

    (async () => {
      try {
        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
          if (error) throw error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (typeof window !== 'undefined' && window.location.hash.length > 1) {
          const hp = new URLSearchParams(window.location.hash.slice(1));
          const access_token = hp.get('access_token');
          const refresh_token = hp.get('refresh_token');
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) throw error;
            window.history.replaceState(
              null,
              '',
              window.location.pathname + window.location.search
            );
          }
        }

        if (!cancelled) router.replace(next);
      } catch {
        if (!cancelled) router.replace('/auth/sign-in?error=OAuthCallback');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center p-6 text-center text-sm text-muted-foreground">
      {t('processing')}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center" aria-hidden>
          <div className="h-4 w-36 animate-pulse rounded bg-muted" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
