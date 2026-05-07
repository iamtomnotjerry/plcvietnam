import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import {
  apiBadRequest,
  apiForbidden,
  apiTooManyRequests,
  apiUnauthorized,
} from '@/lib/api/responses';
import { SignInSchema } from '@/lib/validation/schemas';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { isTrustedAuthRequest } from '@/lib/auth/csrf';
import { hashEmail, logAuthAudit, normalizeEmail } from '@/lib/auth/security';

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isTrustedAuthRequest(request)) {
    return apiForbidden('Yêu cầu không hợp lệ.');
  }

  const ip = getClientIdentifier(request);

  const ipRateLimit = await checkRateLimit(ip, 'auth');
  if (!ipRateLimit.success) {
    logAuthAudit('auth.signin.rate_limited', { ip, reason: 'ip_limit' });
    return apiTooManyRequests('Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau.', ipRateLimit);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logAuthAudit('auth.signin.input_invalid', { ip, reason: 'invalid_json' });
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  const parsed = SignInSchema.safeParse(body);
  if (!parsed.success) {
    logAuthAudit('auth.signin.input_invalid', { ip, reason: 'schema_validation' });
    return apiBadRequest(parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ');
  }

  const normalizedEmail = normalizeEmail(parsed.data.email);
  const emailHash = hashEmail(normalizedEmail);

  const identityRateLimit = await checkRateLimit(`signin:${ip}:${emailHash}`, 'auth');
  if (!identityRateLimit.success) {
    logAuthAudit('auth.signin.rate_limited', { ip, emailHash, reason: 'identity_limit' });
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
    logAuthAudit('auth.signin.failure', { ip, emailHash, reason: 'invalid_credentials' });
    return apiUnauthorized('Email hoặc mật khẩu không đúng.');
  }

  logAuthAudit('auth.signin.success', { ip, emailHash });
  return response;
}
