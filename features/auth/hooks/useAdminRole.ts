'use client';

import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/features/comments/hooks/useSupabaseAuth';

type UserRole = 'admin' | 'author' | 'reader';

export function useAdminRole(): { role: UserRole | null; isEditor: boolean; loading: boolean } {
  const { status } = useSupabaseAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (status !== 'authenticated') {
      setRole(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const response = await fetch('/api/admin/me', { cache: 'no-store' });
        if (!response.ok) {
          if (mounted) setRole(null);
          return;
        }
        const data = (await response.json()) as { role?: UserRole };
        if (mounted) setRole(data.role ?? null);
      } catch {
        if (mounted) setRole(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [status]);

  return {
    role,
    isEditor: role === 'admin' || role === 'author',
    loading,
  };
}
