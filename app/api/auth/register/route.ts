import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth/supabase-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { SignUpSchema } from '@/lib/validation/schemas';
import { ZodError } from 'zod';
import { apiBadRequest, apiInternalError, apiTooManyRequests } from '@/lib/api/responses';
import { isCaptchaEnabled, verifyCaptchaToken } from '@/lib/auth/captcha';
import { hashEmail, logAuthAudit, normalizeEmail } from '@/lib/auth/security';
import {
  buildAuthRequestContext,
  ensureTrustedAuthRequest,
  parseRequestJson,
} from '@/lib/auth/route-utils';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rejectedResponse = ensureTrustedAuthRequest(request);
  if (rejectedResponse) return rejectedResponse;

  const { ip, requestId } = buildAuthRequestContext(request);

  // Rate limiting
  const rateLimit = await checkRateLimit(ip, 'auth');

  if (!rateLimit.success) {
    logAuthAudit('auth.signup.rate_limited', { ip, reason: 'ip_limit', requestId });
    return apiTooManyRequests('Quá nhiều yêu cầu. Vui lòng thử lại sau.', {
      limit: rateLimit.limit,
      remaining: rateLimit.remaining,
      reset: rateLimit.reset,
    });
  }

  // Parse and validate request body
  const parsedJson = await parseRequestJson(request);
  if (!parsedJson.ok) {
    logAuthAudit('auth.signup.input_invalid', { ip, reason: 'invalid_json', requestId });
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  // Validate with Zod
  let validated;
  try {
    validated = SignUpSchema.parse(parsedJson.body);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      logAuthAudit('auth.signup.input_invalid', { ip, reason: 'schema_validation', requestId });
      return apiBadRequest(firstError.message);
    }
    logAuthAudit('auth.signup.input_invalid', { ip, reason: 'schema_unknown', requestId });
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  const normalizedEmail = normalizeEmail(validated.email);
  const emailHash = hashEmail(normalizedEmail);
  if (isCaptchaEnabled()) {
    const captchaValid = await verifyCaptchaToken(validated.captchaToken ?? '', ip);
    if (!captchaValid) {
      logAuthAudit('auth.signup.input_invalid', {
        ip,
        emailHash,
        reason: 'captcha_failed',
        requestId,
      });
      return apiBadRequest('Xác minh bảo mật thất bại. Vui lòng thử lại.');
    }
  }

  const identityRateLimit = await checkRateLimit(`signup:${ip}:${emailHash}`, 'auth');
  if (!identityRateLimit.success) {
    logAuthAudit('auth.signup.rate_limited', {
      ip,
      emailHash,
      reason: 'identity_limit',
      requestId,
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
    logAuthAudit('auth.signup.success', { ip, emailHash, requestId });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === 'EMAIL_TAKEN') {
      // Keep response indistinguishable from successful registration to reduce account enumeration risk.
      logAuthAudit('auth.signup.success', { ip, emailHash, reason: 'already_exists', requestId });
      return NextResponse.json({ ok: true }, { status: 201 });
    }
    if (e instanceof Error && e.message === 'PROFILE_SETUP_FAILED') {
      logAuthAudit('auth.signup.failure', {
        ip,
        emailHash,
        reason: 'profile_setup_failed',
        requestId,
      });
      return apiInternalError('Đăng ký thất bại. Vui lòng thử lại.');
    }
    console.error('[register]', e);
    logAuthAudit('auth.signup.failure', { ip, emailHash, reason: 'unexpected_error', requestId });
    return apiInternalError('Đăng ký thất bại');
  }
}
