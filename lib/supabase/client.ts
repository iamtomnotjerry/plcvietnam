import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const isTest = process.env.NODE_ENV === 'test';
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? (isTest ? 'http://localhost:54321' : '');
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? (isTest ? 'test-anon-key' : '');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = isTest
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
