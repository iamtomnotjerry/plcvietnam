import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type UserRole = 'admin' | 'author' | 'reader';

export async function middleware(request: NextRequest) {
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
    return NextResponse.redirect(
      new URL(
        `/auth/sign-in?callbackUrl=${encodeURIComponent(request.nextUrl.pathname)}`,
        request.url
      )
    );
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
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
