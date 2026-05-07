import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth/supabase-auth';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { SignUpSchema } from '@/lib/validation/schemas';
import { ZodError } from 'zod';
import {
  apiBadRequest,
  apiForbidden,
  apiInternalError,
  apiTooManyRequests,
} from '@/lib/api/responses';
import { isTrustedAuthRequest } from '@/lib/auth/csrf';
import { hashEmail, logAuthAudit, normalizeEmail } from '@/lib/auth/security';

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isTrustedAuthRequest(request)) {
    return apiForbidden('Yêu cầu không hợp lệ.');
  }

  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'auth');

  if (!rateLimit.success) {
    logAuthAudit('auth.signup.rate_limited', { ip: identifier, reason: 'ip_limit' });
    return apiTooManyRequests('Quá nhiều yêu cầu. Vui lòng thử lại sau.', {
      limit: rateLimit.limit,
      remaining: rateLimit.remaining,
      reset: rateLimit.reset,
    });
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logAuthAudit('auth.signup.input_invalid', { ip: identifier, reason: 'invalid_json' });
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  // Validate with Zod
  let validated;
  try {
    validated = SignUpSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      logAuthAudit('auth.signup.input_invalid', { ip: identifier, reason: 'schema_validation' });
      return apiBadRequest(firstError.message);
    }
    logAuthAudit('auth.signup.input_invalid', { ip: identifier, reason: 'schema_unknown' });
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  const normalizedEmail = normalizeEmail(validated.email);
  const emailHash = hashEmail(normalizedEmail);
  const identityRateLimit = await checkRateLimit(`signup:${identifier}:${emailHash}`, 'auth');
  if (!identityRateLimit.success) {
    logAuthAudit('auth.signup.rate_limited', {
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

  // Register user
  try {
    await registerUser({
      email: normalizedEmail,
      password: validated.password,
      name: validated.full_name,
    });
    logAuthAudit('auth.signup.success', { ip: identifier, emailHash });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === 'EMAIL_TAKEN') {
      // Keep response indistinguishable from successful registration to reduce account enumeration risk.
      logAuthAudit('auth.signup.success', { ip: identifier, emailHash, reason: 'already_exists' });
      return NextResponse.json({ ok: true }, { status: 201 });
    }
    if (e instanceof Error && e.message === 'PROFILE_SETUP_FAILED') {
      logAuthAudit('auth.signup.failure', {
        ip: identifier,
        emailHash,
        reason: 'profile_setup_failed',
      });
      return apiInternalError('Đăng ký thất bại. Vui lòng thử lại.');
    }
    console.error('[register]', e);
    logAuthAudit('auth.signup.failure', { ip: identifier, emailHash, reason: 'unexpected_error' });
    return apiInternalError('Đăng ký thất bại');
  }
}
