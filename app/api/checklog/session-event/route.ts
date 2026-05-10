import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { apiBadRequest, apiTooManyRequests, apiUnauthorized } from '@/lib/api/responses';
import { requireAuthenticatedAuth } from '@/lib/auth/server-auth';
import { recordChecklogEvent } from '@/lib/checklog/record-checklog-event';
import type { Json } from '@/lib/supabase/database.types';

const BodySchema = z.object({
  action: z.enum(['signout', 'oauth_callback']),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

function clampMetadata(meta: Record<string, unknown> | undefined): Json {
  if (!meta || typeof meta !== 'object') return {};
  const json = JSON.stringify(meta);
  if (json.length > 2000) return { _truncated: true };
  return meta as Json;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ctx = await requireAuthenticatedAuth();
  if (!ctx) return apiUnauthorized();

  const rate = await checkRateLimit(`checklog-session:${ctx.userId}`, 'api');
  if (!rate.success) {
    return apiTooManyRequests('Quá nhiều yêu cầu.', {
      limit: rate.limit,
      remaining: rate.remaining,
      reset: rate.reset,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return apiBadRequest('Dữ liệu không hợp lệ');

  const ip = getClientIdentifier(request);
  const metadata = clampMetadata(parsed.data.metadata as Record<string, unknown> | undefined);
  const ua = request.headers.get('user-agent');

  await recordChecklogEvent({
    category: 'security',
    channel: parsed.data.action === 'signout' ? 'session.signout' : 'session.oauth_callback',
    source: 'server',
    http_method: 'POST',
    path: '/api/checklog/session-event',
    actor_user_id: ctx.userId,
    ip,
    user_agent: ua ? ua.slice(0, 512) : null,
    request_id: request.headers.get('x-request-id'),
    outcome: 'success',
    metadata,
  });

  return NextResponse.json({ ok: true });
}
