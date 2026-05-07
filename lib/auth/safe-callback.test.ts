import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { resolveSafeCallbackPath } from './safe-callback';

describe('resolveSafeCallbackPath', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    vi.stubGlobal('window', {
      location: {
        origin: 'http://localhost:3000',
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalWindow) {
      vi.stubGlobal('window', originalWindow);
    }
  });

  it('returns fallback for empty callback', () => {
    expect(resolveSafeCallbackPath(undefined)).toBe('/');
  });

  it('accepts relative callback path', () => {
    expect(resolveSafeCallbackPath('/posts/plc-basics?sort=new')).toBe(
      '/posts/plc-basics?sort=new'
    );
  });

  it('rejects protocol-relative callback path', () => {
    expect(resolveSafeCallbackPath('//evil.com')).toBe('/');
  });

  it('accepts same-origin absolute callback and converts to path', () => {
    expect(resolveSafeCallbackPath('http://localhost:3000/about?ref=auth')).toBe('/about?ref=auth');
  });

  it('rejects cross-origin callback URL', () => {
    expect(resolveSafeCallbackPath('https://evil.com/phishing')).toBe('/');
  });
});
