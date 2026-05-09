import type { User } from '@supabase/supabase-js';

/** Resolve profile image from Supabase user (Google uses `picture`; some paths use `avatar_url`). */
export function getUserAvatarUrl(user: User): string | null {
  const m = user.user_metadata ?? {};
  const fromMeta = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);

  const direct = fromMeta(m.avatar_url) ?? fromMeta(m.picture);
  if (direct) return direct;

  const idData = user.identities?.[0]?.identity_data;
  if (idData && typeof idData === 'object') {
    const d = idData as Record<string, unknown>;
    return fromMeta(d.avatar_url) ?? fromMeta(d.picture);
  }

  return null;
}
