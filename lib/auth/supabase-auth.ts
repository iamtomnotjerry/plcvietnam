/**
 * Supabase Auth Service
 * Wraps Supabase Auth operations with proper error handling and type safety.
 * Replaces mock auth store for production use.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

type UserRole = Database['public']['Enums']['user_role'];

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Use service role key for admin operations (server-side only)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient<Database>(url, key);
}

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

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: input.name },
    },
  });

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already exists')) {
      throw new Error('EMAIL_TAKEN');
    }
    throw new Error(error.message);
  }

  if (!data.user) throw new Error('Registration failed');

  // Create profile record
  const admin = getAdminClient();
  await admin.from('profiles').upsert({
    id: data.user.id,
    email: input.email,
    full_name: input.name,
    role: 'reader',
  });

  return {
    id: data.user.id,
    email: input.email,
    name: input.name,
    role: 'reader',
  };
}

// ── Sign In ───────────────────────────────────────────────────────────────────

export async function signInWithPassword(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const supabase = getAnonClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;

  // Fetch role from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, avatar_url')
    .eq('id', data.user.id)
    .single();

  return {
    id: data.user.id,
    email: data.user.email ?? email,
    name: profile?.full_name ?? data.user.user_metadata?.full_name ?? email.split('@')[0],
    role: profile?.role ?? 'reader',
    avatarUrl: profile?.avatar_url ?? data.user.user_metadata?.avatar_url,
  };
}

// ── Password Reset ────────────────────────────────────────────────────────────

export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  const supabase = getAnonClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
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
  const supabase = getAdminClient();

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
  const admin = getAdminClient();

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
