import { createHash } from 'crypto';

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

export function logAuthAudit(event: AuthAuditEvent, payload: AuthAuditPayload): void {
  console.info('[auth-audit]', {
    event,
    ip: payload.ip,
    emailHash: payload.emailHash,
    reason: payload.reason,
    requestId: payload.requestId,
    at: new Date().toISOString(),
  });
}
