import { createHash } from 'crypto';
import { recordChecklogEvent } from '@/lib/checklog/record-checklog-event';
import type { Json } from '@/lib/supabase/database.types';

type AuthAuditEvent =
  | 'auth.signin.success'
  | 'auth.signin.failure'
  | 'auth.signin.rate_limited'
  | 'auth.signin.input_invalid'
  | 'auth.signup.success'
  | 'auth.signup.failure'
  | 'auth.signup.rate_limited'
  | 'auth.signup.input_invalid'
  | 'auth.forgot_password.requested'
  | 'auth.forgot_password.rate_limited'
  | 'auth.forgot_password.input_invalid'
  | 'auth.resend_confirmation.requested'
  | 'auth.resend_confirmation.rate_limited'
  | 'auth.resend_confirmation.input_invalid'
  | 'auth.reset_password.success'
  | 'auth.reset_password.failure'
  | 'auth.reset_password.rate_limited'
  | 'auth.reset_password.input_invalid';

interface AuthAuditPayload {
  ip: string;
  emailHash?: string;
  reason?: string;
  requestId?: string;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashEmail(email: string): string {
  return createHash('sha256').update(normalizeEmail(email)).digest('hex');
}

function outcomeFromAuthEvent(event: AuthAuditEvent): string {
  if (event.includes('rate_limited')) return 'rate_limited';
  if (event.includes('input_invalid')) return 'input_invalid';
  if (event.endsWith('.failure')) return 'failure';
  if (event.endsWith('.success')) return 'success';
  if (event.endsWith('.requested')) return 'requested';
  return 'info';
}

export function logAuthAudit(event: AuthAuditEvent, payload: AuthAuditPayload): void {
  console.info('[auth-audit]', {
    event,
    ip: payload.ip,
    emailHash: payload.emailHash,
    reason: payload.reason,
    requestId: payload.requestId,
    at: new Date().toISOString(),
  });

  const metadata: Json = { reason: payload.reason ?? null };
  void recordChecklogEvent({
    category: 'security',
    channel: event,
    source: 'server',
    ip: payload.ip,
    email_hash: payload.emailHash ?? null,
    request_id: payload.requestId ?? null,
    outcome: outcomeFromAuthEvent(event),
    metadata,
  });
}
