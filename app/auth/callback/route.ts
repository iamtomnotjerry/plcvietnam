import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveSafeCallbackPath } from '@/lib/auth/safe-callback';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = resolveSafeCallbackPath(url.searchParams.get('next'));
  const redirectUrl = new URL(next, request.url);

  if (!code) {
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL('/auth/sign-in?error=OAuthCallback', request.url));
  }

  return NextResponse.redirect(redirectUrl);
}
