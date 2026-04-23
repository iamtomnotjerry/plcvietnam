/**
 * Environment Variable Validation
 * Validates and provides type-safe access to environment variables
 */

import { z } from 'zod';

const envSchema = z.object({
  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),

  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Public URLs
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),

  // Data Provider
  DATA_PROVIDER: z.enum(['mock', 'supabase']).default('mock'),

  // Supabase (optional)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:');
    console.error(error);
    throw new Error('Invalid environment variables');
  }
}

// Export validated environment variables
export const env = validateEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
