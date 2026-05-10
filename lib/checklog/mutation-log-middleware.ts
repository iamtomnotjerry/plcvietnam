import type { NextRequest } from 'next/server';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const SENSITIVE_QUERY_KEYS = new Set([
  'token',
  'code',
  'access_token',
  'refresh_token',
  'token_hash',
  'password',
  'secret',
]);

/**
 * Parse client IP from trusted proxy headers (Edge-safe, mirrors lib/rate-limit intent).
 */
export function getClientIpForEdge(request: Request): string {
  const parseIpHeader = (value: string | null): string | null => {
    if (!value) return null;
    const candidate = value.split(',')[0]?.trim();
    if (!candidate) return null;
    if (candidate.length > 64) return null;
    if (!/^[a-zA-Z0-9:._-]+$/.test(candidate)) return null;
    return candidate;
  };

  const realIp = parseIpHeader(request.headers.get('x-real-ip'));
  if (realIp) return realIp;

  const vercelIp = parseIpHeader(request.headers.get('x-vercel-forwarded-for'));
  if (vercelIp) return vercelIp;

  const forwarded = parseIpHeader(request.headers.get('x-forwarded-for'));
  if (forwarded) return forwarded;

  return 'unknown';
}

export function redactSearchParamsForChecklog(search: string): string | null {
  if (!search) return null;
  const raw = search.startsWith('?') ? search.slice(1) : search;
  if (!raw) return null;
  try {
    const params = new URLSearchParams(raw);
    for (const key of [...params.keys()]) {
      if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
        params.set(key, '[redacted]');
      }
    }
    const s = params.toString();
    if (s.length > 512) return `${s.slice(0, 512)}…`;
    return s || null;
  } catch {
    return null;
  }
}

function isMutationLogEnabled(): boolean {
  return process.env.CHECKLOG_MUTATION_LOG_ENABLED !== 'false';
}

/** View-counter POSTs are high-volume and not useful for operators — skip. */
export function shouldSkipMutationLogPath(pathname: string): boolean {
  return /^\/api\/posts\/[^/]+\/view$/i.test(pathname);
}

/**
 * Fire-and-forget: log mutating HTTP requests from middleware (Edge).
 * Uses PostgREST fetch so we do not bundle Node-only Supabase singleton here.
 */
export function logChecklogMutationFromMiddleware(request: NextRequest): void {
  if (!isMutationLogEnabled()) return;
  if (!MUTATION_METHODS.has(request.method)) return;

  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/_next')) return;
  if (shouldSkipMutationLogPath(pathname)) return;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  const queryRedacted = redactSearchParamsForChecklog(request.nextUrl.search);
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
  const userAgent = request.headers.get('user-agent');
  const ip = getClientIpForEdge(request);

  const row = {
    category: 'http',
    channel: 'mutation',
    source: 'edge',
    http_method: request.method,
    path: pathname,
    query_redacted: queryRedacted,
    ip,
    user_agent: userAgent ? userAgent.slice(0, 512) : null,
    request_id: requestId,
    metadata: {},
  };

  void fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/checklog_events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify([row]),
  }).catch((e) => console.error('[checklog] edge insert failed', e));
}
