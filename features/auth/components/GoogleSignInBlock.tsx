'use client';

import { useSearchParams } from 'next/navigation';
import { resolveSafeCallbackPath } from '@/lib/auth/safe-callback';
import { supabase } from '@/lib/supabase/client';

export function GoogleSignInBlock() {
  const searchParams = useSearchParams();
  const callbackPath = resolveSafeCallbackPath(searchParams.get('callbackUrl'));

  return (
    <button
      type="button"
      onClick={() => {
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackPath)}`;
        void supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        });
      }}
      className="w-full rounded-lg border border-border bg-card py-2.5 text-sm font-medium transition-colors hover:bg-muted"
    >
      Tiếp tục với Google
    </button>
  );
}
