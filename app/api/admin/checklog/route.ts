import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import { apiForbidden, apiInternalError, apiUnauthorized } from '@/lib/api/responses';
import { requireAdminAuth, requireAuthenticatedAuth } from '@/lib/auth/server-auth';
import { getChecklogCreatedAtRange } from '@/lib/checklog/checklog-created-at-range';
import {
  normalizeActorUserIdParam,
  normalizeChecklogOutcomeParam,
  sanitizeChannelSearchFragment,
} from '@/lib/checklog/checklog-list-filters';

const MAX_LIMIT = 100;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdminAuth();
  if (!admin) {
    const authed = await requireAuthenticatedAuth();
    if (!authed) return apiUnauthorized();
    return apiForbidden('Chỉ quản trị viên được xem checklog');
  }

  const { searchParams } = request.nextUrl;
  const limitRaw = searchParams.get('limit');
  const offsetRaw = searchParams.get('offset');
  const limit = Math.min(MAX_LIMIT, Math.max(1, limitRaw ? parseInt(limitRaw, 10) || 50 : 50));
  const offset = Math.max(0, offsetRaw ? parseInt(offsetRaw, 10) || 0 : 0);

  const category = searchParams.get('category');
  const channelExact = searchParams.get('channel');
  const channelSearchRaw = searchParams.get('channelSearch');
  const pathPrefix = searchParams.get('pathPrefix');
  const outcome = normalizeChecklogOutcomeParam(searchParams.get('outcome'));
  const actorUserId = normalizeActorUserIdParam(searchParams.get('actorUserId'));
  const channelSearch = channelSearchRaw ? sanitizeChannelSearchFragment(channelSearchRaw) : '';
  const { fromIso, toIso } = getChecklogCreatedAtRange(request);

  try {
    const db = getServiceClient();
    let q = db
      .from('checklog_events')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) q = q.eq('category', category);
    if (channelExact) q = q.eq('channel', channelExact);
    if (channelSearch) q = q.ilike('channel', `%${channelSearch}%`);
    if (pathPrefix) q = q.ilike('path', `${pathPrefix}%`);
    if (outcome) q = q.eq('outcome', outcome);
    if (actorUserId) q = q.eq('actor_user_id', actorUserId);
    if (fromIso) q = q.gte('created_at', fromIso);
    if (toIso) q = q.lte('created_at', toIso);

    const { data, error, count } = await q;

    if (error) {
      console.error('[api/admin/checklog]', error);
      return apiInternalError('Không thể tải checklog');
    }

    const rows = data ?? [];
    const actorIds = [...new Set(rows.map((r) => r.actor_user_id).filter(Boolean))] as string[];

    let actorMap: Record<string, { full_name: string | null; email: string }> = {};
    if (actorIds.length > 0) {
      const { data: profiles, error: pe } = await db
        .from('profiles')
        .select('id, full_name, email')
        .in('id', actorIds);
      if (!pe && profiles) {
        actorMap = Object.fromEntries(
          profiles.map((p) => [p.id, { full_name: p.full_name, email: p.email }])
        );
      }
    }

    const items = rows.map((row) => ({
      ...row,
      actor_display:
        row.actor_user_id && actorMap[row.actor_user_id] ? actorMap[row.actor_user_id] : null,
    }));

    return NextResponse.json({
      items,
      count: count ?? 0,
      limit,
      offset,
    });
  } catch (e) {
    console.error('[api/admin/checklog]', e);
    return apiInternalError('Không thể tải checklog');
  }
}
