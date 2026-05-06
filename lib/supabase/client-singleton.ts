/**
 * Singleton Supabase Clients
 * Prevents client recreation on every request
 * CRITICAL: Reuses connection pools for performance
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { env } from '@/lib/env';

// Singleton instances
let _anonClient: SupabaseClient<Database> | null = null;
let _serviceClient: SupabaseClient<Database> | null = null;

/**
 * Get anonymous client (public read access)
 * Respects Row Level Security (RLS)
 */
export function getAnonClient(): SupabaseClient<Database> {
  if (!_anonClient) {
    const url = env.NEXT_PUBLIC_SUPABASE_URL;
    const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    _anonClient = createClient<Database>(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-application-name': 'plcvietnam-blog',
        },
      },
    });
  }

  return _anonClient;
}

/**
 * Get service role client (admin access)
 * BYPASSES Row Level Security - use with extreme caution
 * NEVER expose service role key to client
 */
export function getServiceClient(): SupabaseClient<Database> {
  if (!_serviceClient) {
    const url = env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

    // Validate service key is not same as anon key
    if (serviceKey === env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error(
        'SECURITY ERROR: Service role key cannot be the same as anon key! ' +
          'This would expose admin privileges to public.'
      );
    }

    _serviceClient = createClient<Database>(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-application-name': 'plcvietnam-blog-admin',
        },
      },
    });
  }

  return _serviceClient;
}

/**
 * Reset clients (for testing only)
 */
export function resetClients(): void {
  _anonClient = null;
  _serviceClient = null;
}
