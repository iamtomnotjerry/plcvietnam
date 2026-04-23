import { NextRequest, NextResponse } from 'next/server';
import { createMockPasswordResetToken } from '@/lib/auth/mockPasswordResetStore';
import { findMockUserByEmail } from '@/lib/auth/mockUserStore';
import { checkRateLimit, getClientIdentifier, rateLimiters } from '@/lib/rate-limit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, rateLimiters.auth);

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
        retryAfter: rateLimit.reset,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit?.toString() || '',
          'X-RateLimit-Remaining': rateLimit.remaining?.toString() || '',
          'X-RateLimit-Reset': rateLimit.reset?.toString() || '',
        },
      }
    );
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 });
  }

  const user = findMockUserByEmail(email);
  // Always same response shape for unknown emails (avoid account enumeration)
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  const token = createMockPasswordResetToken(user.email);

  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json({
      ok: true,
      devResetToken: token,
      message:
        'Chỉ trong development: dùng devResetToken trên trang đặt lại mật khẩu. Production sẽ gửi email.',
    });
  }

  return NextResponse.json({ ok: true });
}
