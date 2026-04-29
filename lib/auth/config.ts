import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithPassword, ensureProfile } from '@/lib/auth/supabase-auth';

type UserRole = 'admin' | 'author' | 'reader';

const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID?.trim()) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET?.trim());

const facebookConfigured =
  Boolean(process.env.FACEBOOK_CLIENT_ID?.trim()) &&
  Boolean(process.env.FACEBOOK_CLIENT_SECRET?.trim());

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/sign-in',
    error: '/auth/error',
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
    ...(facebookConfigured
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
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

        const user = await signInWithPassword(email, password);
        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl ?? null,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers (Google, Facebook): ensure profile exists in Supabase
      if (
        (account?.provider === 'google' || account?.provider === 'facebook') &&
        user.id &&
        user.email
      ) {
        try {
          // For OAuth, user.id is the provider ID (e.g., Google ID)
          // We need to find or create a profile using email as the key
          const admin = await import('@/lib/supabase/client-singleton').then((m) =>
            m.getServiceClient()
          );

          // Check if profile exists by email
          const { data: existingProfile } = await admin
            .from('profiles')
            .select('id')
            .eq('email', user.email)
            .single();

          if (!existingProfile) {
            // Create new profile with generated UUID
            const { data: newProfile } = await admin
              .from('profiles')
              .insert({
                email: user.email,
                full_name: user.name ?? user.email.split('@')[0],
                avatar_url: user.image ?? null,
                role: 'reader',
              })
              .select('id')
              .single();

            if (newProfile) {
              // Update user.id to use the Supabase UUID
              user.id = newProfile.id;
            }
          } else {
            // Use existing profile ID
            user.id = existingProfile.id;
          }
        } catch (error) {
          console.error('Profile creation error:', error);
          // Non-fatal: profile creation failure shouldn't block sign-in
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id ?? token.sub ?? '';
        token.role = (user as { role?: UserRole }).role ?? 'reader';
        token.picture = user.image ?? token.picture;
      }
      // Persist sub as id fallback
      if (!token.id && token.sub) token.id = token.sub;
      if (!token.role) token.role = 'reader';
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? (token.sub as string) ?? '';
        session.user.role = (token.role as UserRole) ?? 'reader';
        session.user.image = (token.picture as string | null | undefined) ?? session.user.image;
      }
      return session;
    },
  },
};
