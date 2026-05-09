import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/auth/supabase-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { ForgotPasswordSchema } from '@/lib/validation/schemas';
import { ZodError } from 'zod';
import { apiBadRequest, apiTooManyRequests } from '@/lib/api/responses';
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
  const rateLimit = await checkRateLimit(ip, 'auth');

  if (!rateLimit.success) {
    logAuthAudit('auth.forgot_password.rate_limited', { ip, reason: 'ip_limit', requestId });
    return apiTooManyRequests('Quá nhiều yêu cầu. Vui lòng thử lại sau.', {
      limit: rateLimit.limit,
      remaining: rateLimit.remaining,
      reset: rateLimit.reset,
    });
  }

  const parsedJson = await parseRequestJson(request);
  if (!parsedJson.ok) {
    logAuthAudit('auth.forgot_password.input_invalid', { ip, reason: 'invalid_json', requestId });
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  let validated;
  try {
    validated = ForgotPasswordSchema.parse(parsedJson.body);
  } catch (error) {
    if (error instanceof ZodError) {
      logAuthAudit('auth.forgot_password.input_invalid', {
        ip,
        reason: 'schema_validation',
        requestId,
      });
      return apiBadRequest(error.issues[0].message);
    }
    logAuthAudit('auth.forgot_password.input_invalid', {
      ip,
      reason: 'schema_unknown',
      requestId,
    });
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  const normalizedEmail = normalizeEmail(validated.email);
  const emailHash = hashEmail(normalizedEmail);
  if (isCaptchaEnabled()) {
    const captchaValid = await verifyCaptchaToken(validated.captchaToken ?? '', ip);
    if (!captchaValid) {
      logAuthAudit('auth.forgot_password.input_invalid', {
        ip,
        emailHash,
        reason: 'captcha_failed',
        requestId,
      });
      return apiBadRequest('Xác minh bảo mật thất bại. Vui lòng thử lại.');
    }
  }

  const resendCooldown = await checkRateLimit(`forgot-resend:${ip}:${emailHash}`, 'forgotResend');
  if (!resendCooldown.success) {
    logAuthAudit('auth.forgot_password.rate_limited', {
      ip,
      emailHash,
      reason: 'resend_cooldown',
      requestId,
    });
    return apiTooManyRequests('Vui lòng đợi 60 giây trước khi gửi lại yêu cầu.', {
      limit: resendCooldown.limit,
      remaining: resendCooldown.remaining,
      reset: resendCooldown.reset,
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

  logAuthAudit('auth.forgot_password.requested', { ip, emailHash, requestId });
  return NextResponse.json({ ok: true });
}
