import type { NextRequest } from 'next/server';

/** Parse optional `from` / `to` query params as calendar dates (UTC day bounds). */
export function getChecklogCreatedAtRange(request: NextRequest): {
  fromIso: string | null;
  toIso: string | null;
} {
  const { searchParams } = request.nextUrl;
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const fromIso = from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? `${from}T00:00:00.000Z` : null;
  const toIso = to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? `${to}T23:59:59.999Z` : null;
  return { fromIso, toIso };
}
