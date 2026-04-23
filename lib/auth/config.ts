import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { findMockUserByEmail, verifyMockPassword } from '@/lib/auth/mockUserStore';
import type { MockUserRole } from '@/lib/auth/mockUserStore';

const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID?.trim()) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim());

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/sign-in',
  },
  providers: [
    ...(googleConfigured
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    CredentialsProvider({
      id: 'credentials',
      name: 'Email và mật khẩu',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password;
        if (!email || !password) return null;

        const user = findMockUserByEmail(email);
        if (!user || !verifyMockPassword(user, password)) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id ?? (user.email ? String(user.email) : token.sub);
        token.role =
          (user as { role?: MockUserRole }).role ??
          (account?.provider === 'google' ? 'reader' : 'reader');
      }
      if (!token.id && token.sub) token.id = token.sub;
      if (!token.role) token.role = 'reader';
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? (token.sub as string) ?? '';
        session.user.role = (token.role as MockUserRole) ?? 'reader';
      }
      return session;
    },
  },
};
