import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { apiTooManyRequests, apiUnauthorized } from '@/lib/api/responses';
import { SignInSchema } from '@/lib/validation/schemas';
import { checkRateLimit } from '@/lib/rate-limit';
import { isCaptchaEnabled, verifyCaptchaToken } from '@/lib/auth/captcha';
import { hashEmail, logAuthAudit, normalizeEmail } from '@/lib/auth/security';
import {
  badRequest,
  buildAuthRequestContext,
  ensureTrustedAuthRequest,
  parseRequestJson,
} from '@/lib/auth/route-utils';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rejectedResponse = ensureTrustedAuthRequest(request);
  if (rejectedResponse) return rejectedResponse;

  const { ip, requestId } = buildAuthRequestContext(request);

  const ipRateLimit = await checkRateLimit(ip, 'auth');
  if (!ipRateLimit.success) {
    logAuthAudit('auth.signin.rate_limited', { ip, reason: 'ip_limit', requestId });
    return apiTooManyRequests('Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau.', ipRateLimit);
  }

  const parsedJson = await parseRequestJson(request);
  if (!parsedJson.ok) {
    logAuthAudit('auth.signin.input_invalid', { ip, reason: 'invalid_json', requestId });
    return badRequest();
  }

  const parsed = SignInSchema.safeParse(parsedJson.body);
  if (!parsed.success) {
    logAuthAudit('auth.signin.input_invalid', { ip, reason: 'schema_validation', requestId });
    return badRequest(parsed.error.issues[0]?.message);
  }

  const normalizedEmail = normalizeEmail(parsed.data.email);
  const emailHash = hashEmail(normalizedEmail);

  if (isCaptchaEnabled()) {
    const captchaValid = await verifyCaptchaToken(parsed.data.captchaToken ?? '', ip);
    if (!captchaValid) {
      logAuthAudit('auth.signin.input_invalid', {
        ip,
        emailHash,
        reason: 'captcha_failed',
        requestId,
      });
      return badRequest('Xác minh bảo mật thất bại. Vui lòng thử lại.');
    }
  }

  const identityRateLimit = await checkRateLimit(`signin:${ip}:${emailHash}`, 'auth');
  if (!identityRateLimit.success) {
    logAuthAudit('auth.signin.rate_limited', {
      ip,
      emailHash,
      reason: 'identity_limit',
      requestId,
    });
    return apiTooManyRequests(
      'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau.',
      identityRateLimit
    );
  }

  const response = NextResponse.json({ ok: true });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: parsed.data.password,
  });

  if (error) {
    logAuthAudit('auth.signin.failure', {
      ip,
      emailHash,
      reason: 'invalid_credentials',
      requestId,
    });
    return apiUnauthorized('Email hoặc mật khẩu không đúng.');
  }

  logAuthAudit('auth.signin.success', { ip, emailHash, requestId });
  return response;
}
