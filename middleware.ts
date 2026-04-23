import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) =>
      token?.role === 'admin' || token?.role === 'editor',
  },
  pages: {
    signIn: '/auth/sign-in',
  },
});

export const config = {
  matcher: ['/admin/:path*'],
};
