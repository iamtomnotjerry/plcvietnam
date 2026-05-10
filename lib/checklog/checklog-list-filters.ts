/** Strip ILIKE wildcards from user input (avoid accidental broad matches / injection). */
export function sanitizeChannelSearchFragment(raw: string): string {
  return raw
    .trim()
    .replace(/[%_\\]/g, '')
    .slice(0, 96);
}

const ALLOWED_OUTCOMES = new Set([
  'success',
  'failure',
  'rate_limited',
  'input_invalid',
  'requested',
  'info',
]);

export function normalizeChecklogOutcomeParam(raw: string | null): string | null {
  if (!raw) return null;
  const o = raw.trim().toLowerCase();
  return ALLOWED_OUTCOMES.has(o) ? o : null;
}

export function normalizeActorUserIdParam(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(t)) {
    return null;
  }
  return t;
}
