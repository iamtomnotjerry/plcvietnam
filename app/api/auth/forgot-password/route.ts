import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/auth/supabase-auth';
import { checkRateLimit, getClientIdentifier, rateLimiters } from '@/lib/rate-limit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, rateLimiters.auth);

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.', retryAfter: rateLimit.reset },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit?.toString() ?? '',
          'X-RateLimit-Remaining': rateLimit.remaining?.toString() ?? '',
          'X-RateLimit-Reset': rateLimit.reset?.toString() ?? '',
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const redirectTo = `${siteUrl}/auth/reset-password`;

  try {
    // Always return ok to prevent account enumeration
    await requestPasswordReset(email, redirectTo);
  } catch {
    // Silently ignore - don't reveal if email exists
  }

  return NextResponse.json({ ok: true });
}
