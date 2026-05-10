import { createServerClient } from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, NextRequest } from 'next/server';
import { pathForLocale, localeFromPathname } from '@/lib/i18n/urls';
import { logChecklogMutationFromMiddleware } from '@/lib/checklog/mutation-log-middleware';
import { routing } from './i18n/routing';

type UserRole = 'admin' | 'author' | 'reader';

const intlMiddleware = createIntlMiddleware(routing);

/**
 * With `localePrefix: 'as-needed'`, the canonical default locale has no URL prefix (`/architecture`).
 * Client locale switches can still issue RSC fetches to `/vi/...`, which would get a redirect from
 * next-intl and break soft navigation ("Failed to fetch"). Normalize to the unprefixed path first.
 */
function requestWithCanonicalDefaultLocalePath(request: NextRequest): NextRequest {
  const { defaultLocale } = routing;
  const pathname = request.nextUrl.pathname;
  const prefix = `/${defaultLocale}`;
  let canonicalPath: string | null = null;
  if (pathname === prefix) {
    canonicalPath = '/';
  } else if (pathname.startsWith(`${prefix}/`)) {
    canonicalPath = pathname.slice(prefix.length) || '/';
  }
  if (canonicalPath === null) {
    return request;
  }
  const url = request.nextUrl.clone();
  url.pathname = canonicalPath;
  return new NextRequest(url, request);
}

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

/** Checklog UI: default locale `/checklog`, English `/en/checklog`. */
function isChecklogUi(pathname: string) {
  return (
    pathname === '/checklog' ||
    pathname.startsWith('/checklog/') ||
    pathname.startsWith('/en/checklog')
  );
}

/** Integrations health UI: admin-only, same locale rules as checklog. */
function isIntegrationsUi(pathname: string) {
  return (
    pathname === '/integrations' ||
    pathname.startsWith('/integrations/') ||
    pathname.startsWith('/en/integrations')
  );
}

/** System architecture doc UI: admin-only, same locale rules as checklog. */
function isArchitectureUi(pathname: string) {
  return (
    pathname === '/architecture' ||
    pathname.startsWith('/architecture/') ||
    pathname.startsWith('/en/architecture')
  );
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

/**
 * Checklog UI: signed-in users with role admin only (not author).
 */
async function supabaseAdminOnlyGateForUi(
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

  if (role !== 'admin') {
    return NextResponse.redirect(
      new URL(pathForLocale(localeFromPathname(pathname), '/'), request.url)
    );
  }

  return intlResponse;
}

export async function middleware(request: NextRequest) {
  request = requestWithCanonicalDefaultLocalePath(request);
  const pathname = request.nextUrl.pathname;

  logChecklogMutationFromMiddleware(request);

  if (isApiAdmin(pathname)) {
    return supabaseAdminGateForApi(request);
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (isChecklogUi(pathname)) {
    const intlResponse = intlMiddleware(request);
    if (intlResponse.status !== 200) {
      return intlResponse;
    }
    return supabaseAdminOnlyGateForUi(request, intlResponse);
  }

  if (isIntegrationsUi(pathname)) {
    const intlResponse = intlMiddleware(request);
    if (intlResponse.status !== 200) {
      return intlResponse;
    }
    return supabaseAdminOnlyGateForUi(request, intlResponse);
  }

  if (isArchitectureUi(pathname)) {
    const intlResponse = intlMiddleware(request);
    if (intlResponse.status !== 200) {
      return intlResponse;
    }
    return supabaseAdminOnlyGateForUi(request, intlResponse);
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
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/api/:path*'],
};
