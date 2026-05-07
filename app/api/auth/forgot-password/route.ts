import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/auth/supabase-auth';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { ForgotPasswordSchema } from '@/lib/validation/schemas';
import { ZodError } from 'zod';
import { apiBadRequest, apiForbidden, apiTooManyRequests } from '@/lib/api/responses';
import { isTrustedAuthRequest } from '@/lib/auth/csrf';
import { hashEmail, logAuthAudit, normalizeEmail } from '@/lib/auth/security';

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isTrustedAuthRequest(request)) {
    return apiForbidden('Yêu cầu không hợp lệ.');
  }

  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'auth');

  if (!rateLimit.success) {
    logAuthAudit('auth.forgot_password.rate_limited', { ip: identifier, reason: 'ip_limit' });
    return apiTooManyRequests('Quá nhiều yêu cầu. Vui lòng thử lại sau.', {
      limit: rateLimit.limit,
      remaining: rateLimit.remaining,
      reset: rateLimit.reset,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logAuthAudit('auth.forgot_password.input_invalid', { ip: identifier, reason: 'invalid_json' });
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  let validated;
  try {
    validated = ForgotPasswordSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      logAuthAudit('auth.forgot_password.input_invalid', {
        ip: identifier,
        reason: 'schema_validation',
      });
      return apiBadRequest(error.issues[0].message);
    }
    logAuthAudit('auth.forgot_password.input_invalid', {
      ip: identifier,
      reason: 'schema_unknown',
    });
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  const normalizedEmail = normalizeEmail(validated.email);
  const emailHash = hashEmail(normalizedEmail);
  const identityRateLimit = await checkRateLimit(`forgot:${identifier}:${emailHash}`, 'auth');
  if (!identityRateLimit.success) {
    logAuthAudit('auth.forgot_password.rate_limited', {
      ip: identifier,
      emailHash,
      reason: 'identity_limit',
    });
    return apiTooManyRequests('Quá nhiều yêu cầu. Vui lòng thử lại sau.', {
      limit: identityRateLimit.limit,
      remaining: identityRateLimit.remaining,
      reset: identityRateLimit.reset,
    });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const redirectTo = `${siteUrl}/auth/callback?next=/auth/reset-password`;

  try {
    // Always return ok to prevent account enumeration
    await requestPasswordReset(normalizedEmail, redirectTo);
  } catch {
    // Silently ignore — don't reveal if email exists
  }

  logAuthAudit('auth.forgot_password.requested', { ip: identifier, emailHash });
  return NextResponse.json({ ok: true });
}
