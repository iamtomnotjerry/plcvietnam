'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

type TurnstileWindow = Window & {
  turnstile?: {
    render: (
      container: HTMLElement | string,
      options: {
        sitekey: string;
        callback?: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
      }
    ) => string;
    remove: (widgetId: string) => void;
  };
};

interface TurnstileFieldProps {
  onTokenChange: (token: string | null) => void;
}

export function TurnstileField({ onTokenChange }: TurnstileFieldProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? '';
  const enabled = siteKey.length > 0;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (!enabled || !scriptReady || !containerRef.current) return;
    const w = window as TurnstileWindow;
    if (!w.turnstile?.render || widgetIdRef.current) return;

    widgetIdRef.current = w.turnstile.render(containerRef.current, {
      sitekey: siteKey,
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
  }, [enabled, scriptReady, siteKey]);

  if (!enabled) return null;

  return (
    <div className="space-y-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div ref={containerRef} />
      <p className="text-xs text-muted-foreground">Xác minh bảo mật để tiếp tục.</p>
    </div>
  );
}
