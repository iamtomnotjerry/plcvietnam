/**
 * Email confirmation handler
 * Supabase redirects here after user clicks the confirmation link in email.
 * Exchanges token_hash for a session, then redirects to the confirmed page.
 */

import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      return NextResponse.redirect(new URL('/auth/confirmed', baseUrl));
    }
  }

  // Redirect to error page if token is invalid or missing
  return NextResponse.redirect(new URL(`/auth/confirmed?error=1`, baseUrl));
}
