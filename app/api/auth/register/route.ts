import { NextRequest, NextResponse } from 'next/server';
import { registerMockUser } from '@/lib/auth/mockUserStore';
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

  let body: { email?: string; password?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Mật khẩu tối thiểu 8 ký tự' }, { status: 400 });
  }

  try {
    const user = registerMockUser({ email, password, name: name || email.split('@')[0] });
    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof Error && e.message === 'EMAIL_TAKEN') {
      return NextResponse.json({ error: 'Email đã được đăng ký' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Đăng ký thất bại' }, { status: 500 });
  }
}
