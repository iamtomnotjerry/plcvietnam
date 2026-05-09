import { randomUUID } from 'crypto';
import type { NextRequest } from 'next/server';
import { apiBadRequest, apiForbidden } from '@/lib/api/responses';
import { isTrustedAuthRequest } from '@/lib/auth/csrf';
import { getClientIdentifier } from '@/lib/rate-limit';

export interface AuthRequestContext {
  ip: string;
  requestId: string;
}

export function buildAuthRequestContext(request: NextRequest): AuthRequestContext {
  const requestId = request.headers.get('x-request-id') ?? randomUUID();
  return {
    ip: getClientIdentifier(request),
    requestId,
  };
}

export function ensureTrustedAuthRequest(request: NextRequest) {
  if (!isTrustedAuthRequest(request)) {
    return apiForbidden('Yêu cầu không hợp lệ.');
  }
  return null;
}

export async function parseRequestJson(
  request: NextRequest
): Promise<{ ok: true; body: unknown } | { ok: false }> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return { ok: false };
  }
}

export function badRequest(message = 'Dữ liệu không hợp lệ') {
  return apiBadRequest(message);
}
