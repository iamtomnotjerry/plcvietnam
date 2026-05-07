import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import type { Database } from '@/lib/supabase/database.types';

type UserRole = Database['public']['Enums']['user_role'];

export type AuthContext = {
  userId: string;
  email: string;
  role: UserRole;
};

async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const admin = getServiceClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? profile?.email ?? '',
    role: profile?.role ?? 'reader',
  };
}

export async function requireAuthenticatedAuth(): Promise<AuthContext | null> {
  return getAuthContext();
}

export async function requireAdminAuth(): Promise<AuthContext | null> {
  const context = await getAuthContext();
  return context?.role === 'admin' ? context : null;
}

export async function requireEditorAuth(): Promise<AuthContext | null> {
  const context = await getAuthContext();
  if (!context) return null;
  return context.role === 'admin' || context.role === 'author' ? context : null;
}
