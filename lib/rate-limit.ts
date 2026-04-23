/**
 * Rate Limiting Utility
 * Protects API routes from abuse
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis client (in-memory for development, Upstash for production)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : undefined;

// Create rate limiters
export const rateLimiters = {
  // Strict rate limit for auth endpoints (5 requests per 15 minutes)
  auth: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '15 m'),
        analytics: true,
        prefix: '@upstash/ratelimit:auth',
      })
    : null,

  // Moderate rate limit for API endpoints (30 requests per minute)
  api: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, '1 m'),
        analytics: true,
        prefix: '@upstash/ratelimit:api',
      })
    : null,

  // Lenient rate limit for comments (10 requests per minute)
  comments: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        analytics: true,
        prefix: '@upstash/ratelimit:comments',
      })
    : null,
};

/**
 * Check rate limit for a request
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param limiter - Rate limiter to use
 * @returns Whether the request is allowed
 */
export async function checkRateLimit(
  identifier: string,
  limiter: Ratelimit | null
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  // Skip rate limiting in development if no Redis configured
  if (!limiter) {
    return { success: true };
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset,
  };
}

/**
 * Get client identifier from request
 * Uses IP address or user ID
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

  return ip;
}
