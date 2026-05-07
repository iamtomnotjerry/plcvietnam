import { NextRequest, NextResponse } from 'next/server';
import { ResetPasswordSchema } from '@/lib/validation/schemas';
import { ZodError } from 'zod';
import { apiBadRequest, apiForbidden, apiTooManyRequests } from '@/lib/api/responses';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { isTrustedAuthRequest } from '@/lib/auth/csrf';
import { logAuthAudit } from '@/lib/auth/security';

function mapResetPasswordError(error: { code?: string; message?: string } | null): {
  reason: string;
  message: string;
} {
  const normalizedMessage = (error?.message ?? '').toLowerCase();
  const code = error?.code ?? 'unknown';

  if (
    (normalizedMessage.includes('same') &&
      normalizedMessage.includes('password') &&
      normalizedMessage.includes('old')) ||
    (normalizedMessage.includes('different') &&
      normalizedMessage.includes('password') &&
      normalizedMessage.includes('old'))
  ) {
    return {
      reason: `update_failed_same_password:${code}`,
      message: 'Mật khẩu mới không được trùng với mật khẩu cũ',
    };
  }

  if (
    normalizedMessage.includes('weak') ||
    normalizedMessage.includes('password should') ||
    normalizedMessage.includes('password is too short')
  ) {
    return {
      reason: `update_failed_weak_password:${code}`,
      message: 'Mật khẩu chưa đạt chính sách bảo mật. Vui lòng chọn mật khẩu mạnh hơn.',
    };
  }

  if (
    normalizedMessage.includes('expired') ||
    normalizedMessage.includes('invalid') ||
    normalizedMessage.includes('token')
  ) {
    return {
      reason: `update_failed_invalid_token:${code}`,
      message: 'Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
    };
  }

  return {
    reason: `update_failed:${code}`,
    message: 'Đặt lại mật khẩu thất bại. Vui lòng thử mật khẩu khác hoặc yêu cầu link mới.',
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isTrustedAuthRequest(request)) {
    return apiForbidden('Yêu cầu không hợp lệ.');
  }

  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(`${identifier}:reset-password`, 'auth');
  if (!rateLimit.success) {
    logAuthAudit('auth.reset_password.rate_limited', { ip: identifier, reason: 'ip_limit' });
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
    logAuthAudit('auth.reset_password.input_invalid', { ip: identifier, reason: 'invalid_json' });
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  try {
    const validated = ResetPasswordSchema.parse(body);
    const password = validated.password;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      logAuthAudit('auth.reset_password.failure', {
        ip: identifier,
        reason: 'missing_user_session',
      });
      return apiBadRequest('Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      const mapped = mapResetPasswordError(error);
      console.error('[auth/reset-password/updateUser]', {
        code: error.code,
        message: error.message,
      });
      logAuthAudit('auth.reset_password.failure', { ip: identifier, reason: mapped.reason });
      return apiBadRequest(mapped.message);
    }

    logAuthAudit('auth.reset_password.success', { ip: identifier });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      logAuthAudit('auth.reset_password.input_invalid', {
        ip: identifier,
        reason: 'schema_validation',
      });
      return apiBadRequest(error.issues[0]?.message ?? 'Mật khẩu không hợp lệ');
    }
    console.error('[auth/reset-password]', error);
    logAuthAudit('auth.reset_password.failure', { ip: identifier, reason: 'unexpected_error' });
    return apiBadRequest('Đặt lại mật khẩu thất bại');
  }
}
