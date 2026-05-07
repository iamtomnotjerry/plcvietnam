/**
 * Supabase Auth Service
 * Wraps Supabase Auth operations with proper error handling and type safety.
 * Uses singleton clients for performance.
 */

import { getAnonClient, getServiceClient } from '@/lib/supabase/client-singleton';
import type { Database } from '@/lib/supabase/database.types';
import { normalizeEmail } from '@/lib/auth/security';

type UserRole = Database['public']['Enums']['user_role'];

// ── Registration ──────────────────────────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const supabase = getAnonClient();
  const normalizedEmail = normalizeEmail(input.email);

  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const emailRedirectTo = `${siteUrl}/auth/callback?next=/auth/confirmed`;

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: input.password,
    options: {
      data: { full_name: input.name },
      emailRedirectTo,
    },
  });

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already exists')) {
      throw new Error('EMAIL_TAKEN');
    }
    throw new Error(error.message);
  }

  if (!data.user) throw new Error('Registration failed');

  // Create profile record using service client
  const admin = getServiceClient();
  const { error: profileError } = await admin.from('profiles').upsert({
    id: data.user.id,
    email: normalizedEmail,
    full_name: input.name,
    role: 'reader',
  });
  if (profileError) {
    console.error('[register/profile-upsert]', {
      userId: data.user.id,
      reason: profileError.message,
    });
    throw new Error('PROFILE_SETUP_FAILED');
  }

  return {
    id: data.user.id,
    email: normalizedEmail,
    name: input.name,
    role: 'reader',
  };
}

// ── Password Reset ────────────────────────────────────────────────────────────

export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  const supabase = getAnonClient();
  const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
    redirectTo,
  });
  if (error) throw new Error(error.message);
}

export async function updatePassword(
  accessToken: string,
  refreshToken: string,
  newPassword: string
): Promise<void> {
  const supabase = getAnonClient();

  // Set session from tokens
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (sessionError) throw new Error('Token không hợp lệ hoặc đã hết hạn');

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<AuthUser | null> {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, avatar_url')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    name: data.full_name ?? data.email.split('@')[0],
    role: data.role ?? 'reader',
    avatarUrl: data.avatar_url ?? undefined,
  };
}

export async function ensureProfile(
  userId: string,
  email: string,
  name?: string,
  avatarUrl?: string
): Promise<AuthUser> {
  const admin = getServiceClient();

  const { data, error } = await admin
    .from('profiles')
    .upsert(
      {
        id: userId,
        email,
        full_name: name ?? email.split('@')[0],
        avatar_url: avatarUrl ?? null,
        role: 'reader',
      },
      { onConflict: 'id', ignoreDuplicates: false }
    )
    .select('id, email, full_name, role, avatar_url')
    .single();

  if (error || !data) {
    return { id: userId, email, name: name ?? email.split('@')[0], role: 'reader' };
  }

  return {
    id: data.id,
    email: data.email,
    name: data.full_name ?? email.split('@')[0],
    role: data.role ?? 'reader',
    avatarUrl: data.avatar_url ?? undefined,
  };
}
