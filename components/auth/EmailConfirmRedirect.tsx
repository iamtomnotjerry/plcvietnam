'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

/**
 * Detects Supabase email confirmation hash fragment (#access_token=...&type=signup)
 * and redirects to the confirmed page.
 * Place this in the root layout or homepage.
 */
export function EmailConfirmRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.slice(1)); // remove leading #
    const type = params.get('type');
    const accessToken = params.get('access_token');

    // Supabase sets type=signup when confirming email
    if ((type === 'signup' || type === 'email') && accessToken) {
      // Clear the hash from URL then redirect
      window.history.replaceState(null, '', window.location.pathname);
      router.replace('/auth/confirmed' as Route);
    }
  }, [router]);

  return null;
}
