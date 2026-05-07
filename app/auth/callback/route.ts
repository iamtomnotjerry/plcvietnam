import { NextRequest, NextResponse } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { resolveSafeCallbackPath } from '@/lib/auth/safe-callback';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const next = resolveSafeCallbackPath(url.searchParams.get('next'));
  const redirectUrl = new URL(next, request.url);
  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) {
      return NextResponse.redirect(new URL('/auth/confirmed?error=1', request.url));
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    return NextResponse.redirect(redirectUrl);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/auth/sign-in?error=OAuthCallback', request.url));
  }

  return NextResponse.redirect(redirectUrl);
}
