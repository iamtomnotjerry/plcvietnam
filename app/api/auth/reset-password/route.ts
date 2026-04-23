import { NextRequest, NextResponse } from 'next/server';
import { consumeMockPasswordResetToken } from '@/lib/auth/mockPasswordResetStore';
import { updateMockUserPassword } from '@/lib/auth/mockUserStore';

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: { token?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!token) {
    return NextResponse.json({ error: 'Thiếu token' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Mật khẩu tối thiểu 8 ký tự' },
      { status: 400 }
    );
  }

  const email = consumeMockPasswordResetToken(token);
  if (!email) {
    return NextResponse.json(
      { error: 'Token không hợp lệ hoặc đã hết hạn' },
      { status: 400 }
    );
  }

  try {
    updateMockUserPassword(email, password);
  } catch (e) {
    if (e instanceof Error && e.message === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản' }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Đặt lại mật khẩu thất bại' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
