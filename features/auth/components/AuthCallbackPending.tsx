'use client';

import { useTranslations } from 'next-intl';

/**
 * Accessible loading state for OAuth/email auth callback while session is established.
 */
export function AuthCallbackPending({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-[40vh] flex-col items-center justify-center gap-6 p-6 text-center"
    >
      <div className="relative flex h-14 w-14 items-center justify-center" aria-hidden>
        <span className="absolute inset-0 rounded-full border-2 border-muted border-t-primary animate-spin motion-reduce:animate-none" />
      </div>
      <div className="space-y-3">
        <div
          className="mx-auto h-2.5 max-w-[180px] rounded-full bg-muted animate-pulse motion-reduce:animate-none"
          aria-hidden
        />
        <div
          className="mx-auto h-2.5 max-w-[220px] rounded-full bg-muted/80 animate-pulse motion-reduce:animate-none [animation-delay:150ms]"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

/** Suspense fallback for auth callback — matches visible pending UI copy. */
export function AuthCallbackSuspenseFallback() {
  const t = useTranslations('auth.callback');
  return <AuthCallbackPending message={t('processing')} />;
}
