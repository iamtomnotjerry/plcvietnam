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

  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Cloudflare Turnstile (optional)
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),

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
    const isTest = process.env.NODE_ENV === 'test';
    const rawEnv = isTest
      ? {
          NEXT_PUBLIC_SUPABASE_URL:
            process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321',
          NEXT_PUBLIC_SUPABASE_ANON_KEY:
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'test-anon-key',
          SUPABASE_SERVICE_ROLE_KEY:
            process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'test-service-role-key',
          GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
          NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
          TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
          UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
          UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
          NODE_ENV: process.env.NODE_ENV ?? 'test',
        }
      : process.env;

    const parsed = envSchema.parse(rawEnv);

    // Additional validation: Service key should not equal anon key
    if (parsed.SUPABASE_SERVICE_ROLE_KEY === parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error(
        'SUPABASE_SERVICE_ROLE_KEY must be different from NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
    }

    if (parsed.UPSTASH_REDIS_REST_URL && !parsed.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('UPSTASH_REDIS_REST_TOKEN is required when UPSTASH_REDIS_REST_URL is set');
    }

    if (parsed.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !parsed.TURNSTILE_SECRET_KEY) {
      throw new Error(
        'TURNSTILE_SECRET_KEY is required when NEXT_PUBLIC_TURNSTILE_SITE_KEY is configured'
      );
    }

    if (!parsed.NEXT_PUBLIC_TURNSTILE_SITE_KEY && parsed.TURNSTILE_SECRET_KEY) {
      throw new Error(
        'NEXT_PUBLIC_TURNSTILE_SITE_KEY is required when TURNSTILE_SECRET_KEY is configured'
      );
    }

    // Fail fast if Redis is not configured in production.
    if (parsed.NODE_ENV === 'production' && !parsed.UPSTASH_REDIS_REST_URL) {
      throw new Error(
        'UPSTASH_REDIS_REST_URL is required in production. In-memory rate limiting is not allowed for production deployments.'
      );
    }

    // Warn if Google OAuth is not configured
    if (!parsed.GOOGLE_CLIENT_ID || !parsed.GOOGLE_CLIENT_SECRET) {
      console.warn(
        '⚠️ WARNING: Google OAuth not configured. Users will only be able to sign up with email/password.'
      );
    }

    if (parsed.NODE_ENV === 'production' && !parsed.TURNSTILE_SECRET_KEY) {
      console.warn(
        '⚠️ WARNING: Turnstile not configured. Auth endpoints are protected by rate limits but have no CAPTCHA.'
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
