'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export function GoogleSignInBlock() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    <button
      type="button"
      onClick={() => signIn('google', { callbackUrl })}
      className="w-full rounded-lg border border-border bg-card py-2.5 text-sm font-medium transition-colors hover:bg-muted"
    >
      Tiếp tục với Google
    </button>
  );
}
