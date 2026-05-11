/**
 * Admin routes use `lib/api/responses.ts`: `{ error: { code, message } }`.
 * Some legacy handlers still surface a string `error` — accept both.
 */
export function messageFromAdminApiErrorBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const err = (body as { error?: unknown }).error;
  if (typeof err === 'string' && err.trim()) return err.trim();
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message: unknown }).message;
    if (typeof m === 'string' && m.trim()) return m.trim();
  }
  return null;
}
