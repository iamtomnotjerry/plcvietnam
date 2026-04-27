/**
 * Rate Limiting Utility
 * Protects API routes from abuse with Redis-based and in-memory fallback
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Create Redis client (Upstash for production)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : undefined;

// Fallback: In-memory rate limiters (for development or when Redis is unavailable)
// ⚠️ WARNING: Not suitable for multi-instance production deployments
const memoryLimiters = {
  auth: new RateLimiterMemory({
    points: 5, // 5 requests
    duration: 900, // per 15 minutes
    blockDuration: 900,
  }),
  api: new RateLimiterMemory({
    points: 30, // 30 requests
    duration: 60, // per 60 seconds
    blockDuration: 60,
  }),
  comments: new RateLimiterMemory({
    points: 10, // 10 requests
    duration: 60, // per 60 seconds
    blockDuration: 60,
  }),
};

if (!redis) {
  console.warn(
    '⚠️ Rate limiting using in-memory fallback (not suitable for multi-instance production)'
  );
  console.warn(
    '⚠️ Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production-grade rate limiting'
  );
}

// Create Redis-based rate limiters
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
 * Falls back to in-memory limiter if Redis is not configured
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param limiterType - Type of rate limiter to use ('auth', 'api', 'comments')
 * @returns Whether the request is allowed
 */
export async function checkRateLimit(
  identifier: string,
  limiterType: 'auth' | 'api' | 'comments' = 'api'
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  const limiter = rateLimiters[limiterType];

  try {
    // Use Redis-based rate limiter if available
    if (limiter) {
      const { success, limit, remaining, reset } = await limiter.limit(identifier);
      return { success, limit, remaining, reset };
    }

    // Fallback to in-memory rate limiter
    const memoryLimiter = memoryLimiters[limiterType];
    try {
      const result = await memoryLimiter.consume(identifier);
      return {
        success: true,
        limit: memoryLimiter.points,
        remaining: result.remainingPoints,
        reset: Date.now() + (result.msBeforeNext || 0),
      };
    } catch (rateLimiterRes: any) {
      // Rate limit exceeded
      return {
        success: false,
        limit: memoryLimiter.points,
        remaining: 0,
        reset: Date.now() + (rateLimiterRes.msBeforeNext || 60000),
      };
    }
  } catch (error) {
    console.error('Rate limit error:', error);
    // On critical error, fail closed (deny request) for security
    return {
      success: false,
      limit: 30,
      remaining: 0,
    };
  }
}

/**
 * Get client identifier from request
 * Uses real IP from trusted proxy headers (Vercel / standard reverse proxies)
 * Order: x-real-ip → x-vercel-forwarded-for → x-forwarded-for (first entry) → fallback
 */
export function getClientIdentifier(request: Request): string {
  const realIp = request.headers.get('x-real-ip');
  if (realIp?.trim()) return realIp.trim();

  const vercelIp = request.headers.get('x-vercel-forwarded-for');
  if (vercelIp?.trim()) return vercelIp.split(',')[0].trim();

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded?.trim()) return forwarded.split(',')[0].trim();

  return 'unknown';
}
