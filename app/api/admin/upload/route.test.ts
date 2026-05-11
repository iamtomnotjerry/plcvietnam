/** @vitest-environment node */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

vi.mock('@/lib/auth/server-auth', () => ({
  requireEditorAuth: vi.fn(),
}));

vi.mock('@/lib/supabase/storage', () => ({
  uploadFile: vi.fn(),
}));

vi.mock('@/lib/checklog/log-admin-event', () => ({
  logAdminChecklogEvent: vi.fn(),
}));

function imageFormData(overrides?: { type?: string; size?: number; name?: string }) {
  const buf = new Uint8Array(overrides?.size ?? 100);
  const name = overrides?.name ?? 'x.png';
  const type = overrides?.type ?? 'image/png';
  const file = new File([buf], name, { type });
  const fd = new FormData();
  fd.set('file', file);
  fd.set('bucket', 'post_media');
  return fd;
}

describe('POST /api/admin/upload', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { requireEditorAuth } = await import('@/lib/auth/server-auth');
    const { uploadFile } = await import('@/lib/supabase/storage');
    vi.mocked(requireEditorAuth).mockResolvedValue({
      userId: 'user-1',
      email: 'ed@example.com',
      role: 'admin',
    });
    vi.mocked(uploadFile).mockResolvedValue('https://cdn.example.com/u/x.png');
  });

  it('returns 401 when not authenticated as editor', async () => {
    const { requireEditorAuth } = await import('@/lib/auth/server-auth');
    vi.mocked(requireEditorAuth).mockResolvedValueOnce(null);

    const fd = imageFormData();
    const res = await POST(
      new NextRequest('http://localhost/api/admin/upload', {
        method: 'POST',
        body: fd,
      })
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 when file field missing', async () => {
    const fd = new FormData();
    fd.set('bucket', 'post_media');
    const res = await POST(
      new NextRequest('http://localhost/api/admin/upload', {
        method: 'POST',
        body: fd,
      })
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 for disallowed mime type', async () => {
    const fd = imageFormData({ type: 'application/pdf', name: 'x.pdf' });
    const res = await POST(
      new NextRequest('http://localhost/api/admin/upload', {
        method: 'POST',
        body: fd,
      })
    );
    expect(res.status).toBe(400);
  });

  it('returns 201 with url on success', async () => {
    const fd = imageFormData();
    const res = await POST(
      new NextRequest('http://localhost/api/admin/upload', {
        method: 'POST',
        body: fd,
      })
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ url: 'https://cdn.example.com/u/x.png' });
  });
});
