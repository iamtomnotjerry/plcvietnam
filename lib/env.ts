/**
 * Environment Variable Validation
 * Validates all required environment variables at startup
 * Fails fast with clear error messages
 */

import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().refine((v) => {
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  }, 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z
    .string()
    .refine((v) => {
      try {
        new URL(v);
        return true;
      } catch {
        return false;
      }
    }, 'NEXTAUTH_URL must be a valid URL')
    .optional(),

  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Upstash Redis (optional, but recommended for production)
  UPSTASH_REDIS_REST_URL: z
    .string()
    .refine((v) => {
      try {
        new URL(v);
        return true;
      } catch {
        return false;
      }
    }, 'UPSTASH_REDIS_REST_URL must be a valid URL')
    .optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Validate environment variables
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);

    // Additional validation: Service key should not equal anon key
    if (parsed.SUPABASE_SERVICE_ROLE_KEY === parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY must be different from NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
    }

    // Warn if Redis is not configured in production
    if (parsed.NODE_ENV === 'production' && !parsed.UPSTASH_REDIS_REST_URL) {
      console.warn(
        '⚠️ WARNING: UPSTASH_REDIS_REST_URL not configured. Rate limiting will use in-memory fallback (not suitable for multi-instance deployments)'
      );
    }

    // Warn if Google OAuth is not configured
    if (!parsed.GOOGLE_CLIENT_ID || !parsed.GOOGLE_CLIENT_SECRET) {
      console.warn(
        '⚠️ WARNING: Google OAuth not configured. Users will only be able to sign up with email/password.'
      );
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment variable validation failed:');
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      });
      throw new Error('Invalid environment variables. Check .env.local file.');
    }
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
