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

function isApiAdmin(pathname: string) {
  return pathname.startsWith('/api/admin');
}

/** Locale-prefixed or default-locale admin UI (not API). */
function isAdminUi(pathname: string) {
  return pathname.startsWith('/admin') || pathname.startsWith('/en/admin');
}

async function supabaseAdminGateForApi(request: NextRequest): Promise<NextResponse> {
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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();
  const role = (profile?.role ?? 'reader') as UserRole;

  if (role !== 'admin' && role !== 'author') {
    return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
  }

  return response;
}

/**
 * Admin UI: must run next-intl first so `/admin` rewrites to `[locale]` routes.
 * Supabase session refresh cookies are applied to that intl response.
 */
async function supabaseAdminGateForUi(
  request: NextRequest,
  intlResponse: NextResponse
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

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
            intlResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    const signIn = localizedAuthUrl(request, pathname, '/auth/sign-in');
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
    return NextResponse.redirect(localizedAuthUrl(request, pathname, '/auth/sign-in'));
  }

  return intlResponse;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isApiAdmin(pathname)) {
    return supabaseAdminGateForApi(request);
  }

  if (isAdminUi(pathname)) {
    const intlResponse = intlMiddleware(request);
    if (intlResponse.status !== 200) {
      return intlResponse;
    }
    return supabaseAdminGateForUi(request, intlResponse);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/api/admin/:path*'],
};
