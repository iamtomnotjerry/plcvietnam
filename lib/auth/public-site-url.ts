/**
 * Server-side origin for auth email links (signup confirm, password recovery, etc.).
 * Prefer parsing env URLs so trailing paths in misconfigured env values do not leak into redirect targets.
 *
 * Do not use this for OAuth `redirectTo` from the browser — use `window.location.origin` there
 * so the origin matches the active tab.
 */
export function getPublicSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      // Ignore invalid env; fall back below.
    }
  }
  return 'http://localhost:3000';
}
