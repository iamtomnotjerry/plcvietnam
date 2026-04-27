/**
 * Next.js Middleware
 * - Protects /admin routes: requires authenticated session with admin/author role
 * - Protects /api/admin routes: same requirement
 * - Redirects unauthenticated users to sign-in
 * - Type-safe with NextAuth
 */

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequestWithAuth } from 'next-auth/middleware';

type UserRole = 'admin' | 'author' | 'reader';

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const role = token?.role as UserRole | undefined;
    const pathname = req.nextUrl.pathname;

    // Admin routes require admin or author role
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if (role !== 'admin' && role !== 'author') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
        }
        return NextResponse.redirect(
          new URL('/auth/sign-in?callbackUrl=' + encodeURIComponent(pathname), req.url)
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const pathname = req.nextUrl.pathname;
        // Admin routes require authentication
        if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
          return Boolean(token);
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
