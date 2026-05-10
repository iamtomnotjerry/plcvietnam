import type { NextRequest } from 'next/server';
import { getClientIdentifier } from '@/lib/rate-limit';
import type { AuthContext } from '@/lib/auth/server-auth';
import type { Json } from '@/lib/supabase/database.types';
import { recordChecklogEvent } from '@/lib/checklog/record-checklog-event';

/**
 * Fire-and-forget: record a CMS/admin action in checklog (category `admin`).
 */
export function logAdminChecklogEvent(opts: {
  request: NextRequest;
  auth: AuthContext;
  channel: string;
  outcome: 'success' | 'failure';
  metadata?: Json;
}): void {
  void recordChecklogEvent({
    category: 'admin',
    channel: opts.channel,
    source: 'server',
    http_method: opts.request.method,
    path: opts.request.nextUrl.pathname,
    actor_user_id: opts.auth.userId,
    ip: getClientIdentifier(opts.request),
    user_agent: opts.request.headers.get('user-agent')?.slice(0, 512) ?? null,
    request_id: opts.request.headers.get('x-request-id'),
    outcome: opts.outcome,
    metadata: opts.metadata ?? {},
  });
}
