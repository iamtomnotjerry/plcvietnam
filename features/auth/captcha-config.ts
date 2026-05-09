/** Single source of truth for whether Cloudflare Turnstile is wired up on the client. */
export const isCaptchaConfigured: boolean = Boolean(
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
);
