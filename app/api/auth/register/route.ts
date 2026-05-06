import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth/supabase-auth';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { SignUpSchema } from '@/lib/validation/schemas';
import { ZodError } from 'zod';
import { apiBadRequest, apiConflict, apiInternalError } from '@/lib/api/responses';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimit = await checkRateLimit(identifier, 'auth');

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
        },
        retryAfter: rateLimit.reset,
      },
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

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  // Validate with Zod
  let validated;
  try {
    validated = SignUpSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return apiBadRequest(firstError.message);
    }
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  // Register user
  try {
    const user = await registerUser({
      email: validated.email,
      password: validated.password,
      name: validated.full_name,
    });
    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof Error && e.message === 'EMAIL_TAKEN') {
      return apiConflict('Email đã được đăng ký');
    }
    console.error('[register]', e);
    return apiInternalError('Đăng ký thất bại');
  }
}
