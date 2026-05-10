import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import { apiForbidden, apiInternalError, apiUnauthorized } from '@/lib/api/responses';
import { requireAdminAuth, requireAuthenticatedAuth } from '@/lib/auth/server-auth';
import { getChecklogCreatedAtRange } from '@/lib/checklog/checklog-created-at-range';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdminAuth();
  if (!admin) {
    const authed = await requireAuthenticatedAuth();
    if (!authed) return apiUnauthorized();
    return apiForbidden('Chỉ quản trị viên được xem checklog');
  }

  const { fromIso, toIso } = getChecklogCreatedAtRange(request);

  try {
    const db = getServiceClient();
    const base = () => {
      let q = db.from('checklog_events').select('*', { count: 'exact', head: true });
      if (fromIso) q = q.gte('created_at', fromIso);
      if (toIso) q = q.lte('created_at', toIso);
      return q;
    };

    const [total, http, security, content, adminCat] = await Promise.all([
      base(),
      base().eq('category', 'http'),
      base().eq('category', 'security'),
      base().eq('category', 'content'),
      base().eq('category', 'admin'),
    ]);

    const errs = [total.error, http.error, security.error, content.error, adminCat.error].filter(
      Boolean
    );
    if (errs.length) {
      console.error('[api/admin/checklog/stats]', errs[0]);
      return apiInternalError('Không thể tải thống kê checklog');
    }

    const t = total.count ?? 0;
    const sumKnown =
      (http.count ?? 0) + (security.count ?? 0) + (content.count ?? 0) + (adminCat.count ?? 0);
    const other = Math.max(0, t - sumKnown);

    return NextResponse.json({
      total: t,
      byCategory: {
        http: http.count ?? 0,
        security: security.count ?? 0,
        content: content.count ?? 0,
        admin: adminCat.count ?? 0,
        other,
      },
    });
  } catch (e) {
    console.error('[api/admin/checklog/stats]', e);
    return apiInternalError('Không thể tải thống kê checklog');
  }
}
