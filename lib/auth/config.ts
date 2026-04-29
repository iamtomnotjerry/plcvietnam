import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signInWithPassword } from '@/lib/auth/supabase-auth';

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
    async signIn({ user, account, profile }) {
      // For OAuth providers (Google, Facebook): ensure profile exists in Supabase
      if (account?.provider && account.provider !== 'credentials' && user.email) {
        try {
          const { getServiceClient } = await import('@/lib/supabase/client-singleton');
          const admin = getServiceClient();

          // For OAuth, we need to find the Supabase auth.users record by email
          // The trigger will have created the profile automatically
          const { data: authUser } = await admin.auth.admin.listUsers();
          const supabaseUser = authUser?.users?.find((u) => u.email === user.email);

          if (supabaseUser) {
            // Map OAuth provider ID to Supabase UUID
            user.id = supabaseUser.id;

            // Update profile with avatar from OAuth provider
            const avatarUrl = user.image || (profile as any)?.picture || (profile as any)?.avatar_url;
            
            if (avatarUrl) {
              await admin
                .from('profiles')
                .update({ 
                  avatar_url: avatarUrl,
                  full_name: user.name || (profile as any)?.name || supabaseUser.email?.split('@')[0]
                })
                .eq('id', supabaseUser.id);
            }

            // Get updated profile data
            const { data: updatedProfile } = await admin
              .from('profiles')
              .select('avatar_url, full_name')
              .eq('id', supabaseUser.id)
              .maybeSingle();

            if (updatedProfile) {
              user.name = updatedProfile.full_name ?? user.name;
              user.image = updatedProfile.avatar_url ?? user.image;
            }
          }
        } catch (error) {
          console.error('OAuth profile lookup error:', error);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id ?? token.sub ?? '';
        token.role = (user as { role?: UserRole }).role ?? 'reader';
        token.picture = user.image ?? token.picture;
        token.name = user.name ?? token.name;
      }

      // For OAuth users on subsequent requests, ensure we have the Supabase UUID
      if (
        account?.provider &&
        account.provider !== 'credentials' &&
        token.email &&
        !token.id?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      ) {
        try {
          const { getServiceClient } = await import('@/lib/supabase/client-singleton');
          const admin = getServiceClient();

          const { data: profile } = await admin
            .from('profiles')
            .select('id, avatar_url, full_name')
            .eq('email', token.email as string)
            .maybeSingle();

          if (profile) {
            token.id = profile.id;
            token.picture = profile.avatar_url ?? token.picture;
            token.name = profile.full_name ?? token.name;
          }
        } catch (error) {
          console.error('JWT profile lookup error:', error);
        }
      }

      // Fallback defaults
      if (!token.id && token.sub) token.id = token.sub;
      if (!token.role) token.role = 'reader';
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? (token.sub as string) ?? '';
        session.user.role = (token.role as UserRole) ?? 'reader';
        session.user.image = (token.picture as string | null | undefined) ?? session.user.image;
        session.user.name = (token.name as string | null | undefined) ?? session.user.name;
      }
      return session;
    },
  },
};
