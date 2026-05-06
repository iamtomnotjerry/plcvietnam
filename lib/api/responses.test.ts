import { describe, expect, it } from 'vitest';
import {
  apiBadRequest,
  apiConflict,
  apiInternalError,
  apiNotFound,
  apiTooManyRequests,
  apiUnauthorized,
} from './responses';

describe('api responses helpers', () => {
  it('returns standardized unauthorized response', async () => {
    const res = apiUnauthorized();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body).toEqual({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Không có quyền',
      },
    });
  });

  it('returns standardized bad request response', async () => {
    const res = apiBadRequest('Invalid payload');
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid payload',
      },
    });
  });

  it('returns standardized internal error response', async () => {
    const res = apiInternalError('Server failure');
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Server failure',
      },
    });
  });

  it('returns standardized conflict response', async () => {
    const res = apiConflict('Duplicate slug');
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body).toEqual({
      error: {
        code: 'CONFLICT',
        message: 'Duplicate slug',
      },
    });
  });

  it('returns standardized too many requests response', async () => {
    const res = apiTooManyRequests('Rate limit exceeded', {
      limit: 30,
      remaining: 0,
      reset: 123456,
    });
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body).toEqual({
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded',
      },
    });
    expect(res.headers.get('X-RateLimit-Limit')).toBe('30');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(res.headers.get('X-RateLimit-Reset')).toBe('123456');
  });

  it('returns standardized not found response', async () => {
    const res = apiNotFound('Book not found');
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Book not found',
      },
    });
  });
});
