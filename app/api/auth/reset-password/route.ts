import { NextRequest, NextResponse } from 'next/server';
import { updatePassword } from '@/lib/auth/supabase-auth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: { access_token?: string; refresh_token?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const accessToken = typeof body.access_token === 'string' ? body.access_token.trim() : '';
  const refreshToken = typeof body.refresh_token === 'string' ? body.refresh_token.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: 'Thiếu token xác thực' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Mật khẩu tối thiểu 8 ký tự' }, { status: 400 });
  }

  try {
    await updatePassword(accessToken, refreshToken, password);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Đặt lại mật khẩu thất bại';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
