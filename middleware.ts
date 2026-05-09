import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { pathForLocale, localeFromPathname } from '@/lib/i18n/urls';
import { routing } from './i18n/routing';

type UserRole = 'admin' | 'author' | 'reader';

const intlMiddleware = createIntlMiddleware(routing);

function localizedAuthUrl(request: NextRequest, pathname: string, path: string): URL {
  const locale = localeFromPathname(pathname);
  const localized = pathForLocale(locale, path);
  return new URL(localized, request.url);
}

function isAdminArea(pathname: string) {
  return (
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/en/admin')
  );
}

async function supabaseAdminGate(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    const signIn = localizedAuthUrl(request, request.nextUrl.pathname, '/auth/sign-in');
    signIn.searchParams.set('callbackUrl', returnTo);
    return NextResponse.redirect(signIn);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  const role = (profile?.role ?? 'reader') as UserRole;

  if (role !== 'admin' && role !== 'author') {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
    }
    return NextResponse.redirect(
      localizedAuthUrl(request, request.nextUrl.pathname, '/auth/sign-in')
    );
  }

  return response;
}

export async function middleware(request: NextRequest) {
  if (isAdminArea(request.nextUrl.pathname)) {
    return supabaseAdminGate(request);
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/api/admin/:path*'],
};
