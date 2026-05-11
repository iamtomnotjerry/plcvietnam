import type { NextRequest } from 'next/server';
import type { NextResponse } from 'next/server';

export const REQUEST_ID_HEADER = 'x-request-id';

/** Accept client-provided id if safe; otherwise generate UUID. */
const INCOMING_ID = /^[a-zA-Z0-9._-]{8,128}$/;

export function resolveRequestId(request: NextRequest): string {
  const incoming = request.headers.get(REQUEST_ID_HEADER)?.trim();
  if (incoming && INCOMING_ID.test(incoming)) return incoming;
  return crypto.randomUUID();
}

export function withRequestIdHeader<T extends NextResponse>(request: NextRequest, response: T): T {
  response.headers.set(REQUEST_ID_HEADER, resolveRequestId(request));
  return response;
}

/** Value middleware forwarded on `NextRequest` (may be absent in tests or non-admin routes). */
export function getForwardedRequestId(request: Pick<NextRequest, 'headers'>): string | undefined {
  const raw = request.headers.get(REQUEST_ID_HEADER)?.trim();
  return raw && raw.length > 0 ? raw : undefined;
}

/** Structured `console.error` for route handlers (correlates with `x-request-id` / Checklog `request_id`). */
export function logRouteError(
  tag: string,
  request: Pick<NextRequest, 'headers'>,
  error: unknown
): void {
  const requestId = getForwardedRequestId(request);
  if (requestId) console.error(tag, { requestId }, error);
  else console.error(tag, error);
}
