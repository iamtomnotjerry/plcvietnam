import { NextRequest, NextResponse } from 'next/server';
import { updatePassword } from '@/lib/auth/supabase-auth';
import { PasswordSchema } from '@/lib/validation/schemas';
import { ZodError } from 'zod';
import { apiBadRequest } from '@/lib/api/responses';

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: { access_token?: string; refresh_token?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return apiBadRequest('Dữ liệu không hợp lệ');
  }

  const accessToken = typeof body.access_token === 'string' ? body.access_token.trim() : '';
  const refreshToken = typeof body.refresh_token === 'string' ? body.refresh_token.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!accessToken || !refreshToken) {
    return apiBadRequest('Thiếu token xác thực');
  }
  try {
    PasswordSchema.parse(password);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiBadRequest(error.issues[0]?.message ?? 'Mật khẩu không hợp lệ');
    }
    return apiBadRequest('Mật khẩu không hợp lệ');
  }

  try {
    await updatePassword(accessToken, refreshToken, password);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[auth/reset-password]', error);
    return apiBadRequest('Đặt lại mật khẩu thất bại');
  }
}
