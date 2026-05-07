import type { NextRequest } from 'next/server';

function getTrustedOrigins(request: NextRequest): Set<string> {
  const origins = new Set<string>([request.nextUrl.origin]);
  const envOrigins = [process.env.NEXT_PUBLIC_BASE_URL, process.env.NEXT_PUBLIC_SITE_URL];

  for (const raw of envOrigins) {
    if (!raw) continue;
    try {
      origins.add(new URL(raw).origin);
    } catch {
      // Ignore invalid env values at runtime and keep request origin as trusted baseline.
    }
  }

  return origins;
}

function parseOrigin(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

/**
 * Basic CSRF guard for cookie-based auth endpoints.
 * Reject explicit cross-site requests and allow same-origin/same-site requests.
 */
export function isTrustedAuthRequest(request: NextRequest): boolean {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite === 'cross-site') return false;

  const trustedOrigins = getTrustedOrigins(request);

  const origin = parseOrigin(request.headers.get('origin'));
  if (origin) return trustedOrigins.has(origin);

  const referer = parseOrigin(request.headers.get('referer'));
  if (referer) return trustedOrigins.has(referer);

  return true;
}
