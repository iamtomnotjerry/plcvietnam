import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  REQUEST_ID_HEADER,
  getForwardedRequestId,
  logRouteError,
  resolveRequestId,
} from './request-id';

describe('resolveRequestId', () => {
  it('accepts safe client-provided id', () => {
    const req = new NextRequest('http://localhost/x', {
      headers: { [REQUEST_ID_HEADER]: 'trace-abc-123' },
    });
    expect(resolveRequestId(req)).toBe('trace-abc-123');
  });

  it('generates uuid when header missing', () => {
    const req = new NextRequest('http://localhost/x');
    const id = resolveRequestId(req);
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('rejects too-short incoming and generates new', () => {
    const req = new NextRequest('http://localhost/x', {
      headers: { [REQUEST_ID_HEADER]: 'short' },
    });
    const id = resolveRequestId(req);
    expect(id).not.toBe('short');
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
  });
});

describe('getForwardedRequestId', () => {
  it('returns trimmed header when present', () => {
    const req = new NextRequest('http://localhost/x', {
      headers: { [REQUEST_ID_HEADER]: '  corr-abc-12345678  ' },
    });
    expect(getForwardedRequestId(req)).toBe('corr-abc-12345678');
  });

  it('returns undefined when header missing', () => {
    const req = new NextRequest('http://localhost/x');
    expect(getForwardedRequestId(req)).toBeUndefined();
  });
});

describe('logRouteError', () => {
  it('includes requestId when header set', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = new NextRequest('http://localhost/x', {
      headers: { [REQUEST_ID_HEADER]: 'rid-abcdefgh' },
    });
    logRouteError('[tag]', req, new Error('e'));
    expect(spy).toHaveBeenCalledWith('[tag]', { requestId: 'rid-abcdefgh' }, expect.any(Error));
    spy.mockRestore();
  });

  it('logs two args when request id absent', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const req = new NextRequest('http://localhost/x');
    logRouteError('[tag]', req, 'plain');
    expect(spy).toHaveBeenCalledWith('[tag]', 'plain');
    spy.mockRestore();
  });
});
