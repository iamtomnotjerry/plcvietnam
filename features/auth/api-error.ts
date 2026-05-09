/** Standard error envelope returned by all `/api/auth/*` routes (see `lib/api/responses.ts`). */
export interface ApiErrorResponse {
  error?: { code?: string; message?: string } | string;
}

/**
 * Pull a human-readable message out of an API error payload.
 * Tolerant to legacy/unknown shapes; falls back to `defaultMessage`.
 */
export function extractApiErrorMessage(payload: unknown, defaultMessage: string): string {
  const data = payload as ApiErrorResponse | null | undefined;
  if (!data) return defaultMessage;
  if (typeof data.error === 'string') return data.error;
  if (data.error && typeof data.error.message === 'string') return data.error.message;
  return defaultMessage;
}
