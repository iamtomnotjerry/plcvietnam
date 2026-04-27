/**
 * Singleton Supabase Clients
 * Prevents client recreation on every request
 * CRITICAL: Reuses connection pools for performance
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Singleton instances
let _anonClient: SupabaseClient<Database> | null = null;
let _serviceClient: SupabaseClient<Database> | null = null;

/**
 * Get anonymous client (public read access)
 * Respects Row Level Security (RLS)
 */
export function getAnonClient(): SupabaseClient<Database> {
  if (!_anonClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
      );
    }

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
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    }

    if (!serviceKey) {
      throw new Error(
        'CRITICAL: SUPABASE_SERVICE_ROLE_KEY is required for admin operations. ' +
          'Never use anon key for admin operations! ' +
          'Get service role key from: Supabase Dashboard → Settings → API → service_role'
      );
    }

    // Validate service key is not same as anon key
    if (serviceKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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
