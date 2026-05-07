import { NextResponse } from 'next/server';

type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'BAD_REQUEST'
  | 'CONFLICT'
  | 'TOO_MANY_REQUESTS'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

interface ErrorBody {
  error: {
    code: ErrorCode;
    message: string;
  };
}

interface ApiErrorOptions {
  headers?: HeadersInit;
}

export function apiError(
  status: number,
  code: ErrorCode,
  message: string,
  options?: ApiErrorOptions
): NextResponse<ErrorBody> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status, headers: options?.headers }
  );
}

export function apiUnauthorized(message = 'Không có quyền'): NextResponse<ErrorBody> {
  return apiError(401, 'UNAUTHORIZED', message);
}

export function apiForbidden(message = 'Không được phép'): NextResponse<ErrorBody> {
  return apiError(403, 'FORBIDDEN', message);
}

export function apiBadRequest(message: string): NextResponse<ErrorBody> {
  return apiError(400, 'BAD_REQUEST', message);
}

export function apiInternalError(message = 'Đã xảy ra lỗi hệ thống'): NextResponse<ErrorBody> {
  return apiError(500, 'INTERNAL_ERROR', message);
}

export function apiNotFound(message: string): NextResponse<ErrorBody> {
  return apiError(404, 'NOT_FOUND', message);
}

export function apiConflict(message: string): NextResponse<ErrorBody> {
  return apiError(409, 'CONFLICT', message);
}

export function apiTooManyRequests(
  message: string,
  options?: { limit?: number; remaining?: number; reset?: number }
): NextResponse<ErrorBody> {
  const headers: HeadersInit = {};
  if (options?.limit !== undefined) headers['X-RateLimit-Limit'] = String(options.limit);
  if (options?.remaining !== undefined)
    headers['X-RateLimit-Remaining'] = String(options.remaining);
  if (options?.reset !== undefined) headers['X-RateLimit-Reset'] = String(options.reset);
  return apiError(429, 'TOO_MANY_REQUESTS', message, { headers });
}
