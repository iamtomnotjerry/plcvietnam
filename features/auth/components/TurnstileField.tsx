'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useThemeContext } from '@/lib/theme/ThemeProvider';

type TurnstileTheme = 'light' | 'dark' | 'auto';
type TurnstileSize = 'normal' | 'flexible' | 'compact';

type TurnstileWindow = Window & {
  turnstile?: {
    render: (
      container: HTMLElement | string,
      options: {
        sitekey: string;
        theme?: TurnstileTheme;
        size?: TurnstileSize;
        callback?: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
      }
    ) => string;
    remove: (widgetId: string) => void;
    reset: (widgetId: string) => void;
  };
};

interface TurnstileFieldProps {
  onTokenChange: (token: string | null) => void;
  /**
   * Increment after a failed auth request. Turnstile response tokens are single-use;
   * reusing the same token on the next submit always fails server verification.
   */
  resetNonce?: number;
}

export function TurnstileField({ onTokenChange, resetNonce = 0 }: TurnstileFieldProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? '';
  const enabled = siteKey.length > 0;
  const { theme } = useThemeContext();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (!enabled || !scriptReady || resetNonce === 0) return;
    const id = widgetIdRef.current;
    const w = window as TurnstileWindow;
    if (id && w.turnstile?.reset) {
      try {
        w.turnstile.reset(id);
      } catch {
        // ignore
      }
    }
    onTokenChangeRef.current(null);
  }, [resetNonce, enabled, scriptReady]);

  useEffect(() => {
    if (!enabled || !scriptReady || !containerRef.current) return;
    const w = window as TurnstileWindow;
    if (!w.turnstile?.render) return;

    if (widgetIdRef.current && w.turnstile.remove) {
      try {
        w.turnstile.remove(widgetIdRef.current);
      } catch {
        // ignore
      }
      widgetIdRef.current = null;
      onTokenChangeRef.current(null);
    }

    widgetIdRef.current = w.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme,
      size: 'flexible',
      callback: (token: string) => onTokenChangeRef.current(token),
      'expired-callback': () => onTokenChangeRef.current(null),
      'error-callback': () => onTokenChangeRef.current(null),
    });

    return () => {
      const id = widgetIdRef.current;
      const tw = window as TurnstileWindow;
      if (id && tw.turnstile?.remove) {
        try {
          tw.turnstile.remove(id);
        } catch {
          // Widget có thể đã bị Cloudflare gỡ (vd. iframe bị unmount sớm) — bỏ qua.
        }
      }
      widgetIdRef.current = null;
    };
  }, [enabled, scriptReady, siteKey, theme]);

  if (!enabled) return null;

  return (
    <div className="space-y-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} className="w-full overflow-hidden [&>*]:!w-full" />
      <p className="text-xs text-muted-foreground">Xác minh bảo mật để tiếp tục.</p>
    </div>
  );
}
