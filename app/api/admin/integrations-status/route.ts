import { NextResponse } from 'next/server';
import { apiForbidden, apiInternalError, apiUnauthorized } from '@/lib/api/responses';
import { requireAdminAuth, requireAuthenticatedAuth } from '@/lib/auth/server-auth';
import { runIntegrationHealthChecks } from '@/lib/integrations/run-integration-health-checks';

export async function GET(): Promise<NextResponse> {
  const admin = await requireAdminAuth();
  if (!admin) {
    const authed = await requireAuthenticatedAuth();
    if (!authed) return apiUnauthorized();
    return apiForbidden('Chỉ quản trị viên được xem trạng thái tích hợp');
  }

  try {
    const report = await runIntegrationHealthChecks();
    return NextResponse.json(report);
  } catch (e) {
    console.error('[api/admin/integrations-status]', e);
    return apiInternalError('Không thể kiểm tra tích hợp');
  }
}
