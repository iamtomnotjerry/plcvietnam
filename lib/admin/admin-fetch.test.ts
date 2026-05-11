import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { adminFetchFormDataJson, adminFetchJson } from './admin-fetch';

describe('adminFetchJson', () => {
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  it('returns parsed JSON on 200', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    await expect(adminFetchJson<{ ok: boolean }>('/api/admin/x')).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/x',
      expect.objectContaining({ credentials: 'same-origin' })
    );
  });

  it('throws with standardized admin error message on 400', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'BAD_REQUEST', message: 'Bad' } }), {
        status: 400,
      })
    );
    await expect(adminFetchJson('/api/admin/x')).rejects.toThrow('Bad');
  });

  it('resolves undefined on 204 empty body', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 204 }));
    await expect(adminFetchJson<void>('/api/admin/x')).resolves.toBeUndefined();
  });
});

describe('adminFetchFormDataJson', () => {
  const origFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = origFetch;
  });

  it('POSTs FormData and parses JSON', async () => {
    const fd = new FormData();
    fd.set('file', new Blob(['x'], { type: 'image/png' }), 'a.png');
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ url: 'https://example.com/a.png' }), { status: 201 })
    );
    await expect(adminFetchFormDataJson<{ url: string }>('/api/admin/upload', fd)).resolves.toEqual(
      {
        url: 'https://example.com/a.png',
      }
    );
    expect(fetch).toHaveBeenCalledWith(
      '/api/admin/upload',
      expect.objectContaining({
        method: 'POST',
        body: fd,
        credentials: 'same-origin',
      })
    );
  });
});
