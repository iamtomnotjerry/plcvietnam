/** @vitest-environment node */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PATCH } from './route';

vi.mock('@/lib/auth/server-auth', () => ({
  requireEditorAuth: vi.fn(),
}));

vi.mock('@/lib/checklog/log-admin-event', () => ({
  logAdminChecklogEvent: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const eqMock = vi.fn().mockResolvedValue({ error: null });
const updateMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ update: updateMock }));

vi.mock('@/lib/supabase/client-singleton', () => ({
  getServiceClient: vi.fn(() => ({ from: fromMock })),
}));

describe('PATCH /api/admin/reorder', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { requireEditorAuth } = await import('@/lib/auth/server-auth');
    vi.mocked(requireEditorAuth).mockResolvedValue({
      userId: 'u1',
      email: 'a@example.com',
      role: 'admin',
    });
  });

  it('returns 401 when not editor', async () => {
    const { requireEditorAuth } = await import('@/lib/auth/server-auth');
    vi.mocked(requireEditorAuth).mockResolvedValueOnce(null);

    const res = await PATCH(
      new NextRequest('http://localhost/api/admin/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'field',
          items: [{ id: 'f1', order: 0 }],
        }),
      })
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 when body invalid', async () => {
    const res = await PATCH(
      new NextRequest('http://localhost/api/admin/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'field' }),
      })
    );
    expect(res.status).toBe(400);
  });

  it('returns 200 and updates when payload valid', async () => {
    const res = await PATCH(
      new NextRequest('http://localhost/api/admin/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'post',
          items: [
            { id: 'p1', order: 0 },
            { id: 'p2', order: 1 },
          ],
        }),
      })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(fromMock).toHaveBeenCalledWith('posts');
    expect(updateMock).toHaveBeenCalled();
  });
});
