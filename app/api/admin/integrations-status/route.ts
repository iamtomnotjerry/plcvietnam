import { NextRequest, NextResponse } from 'next/server';
import { apiForbidden, apiInternalError, apiUnauthorized } from '@/lib/api/responses';
import { requireAdminAuth, requireAuthenticatedAuth } from '@/lib/auth/server-auth';
import { runIntegrationHealthChecks } from '@/lib/integrations/run-integration-health-checks';
import { logRouteError } from '@/lib/api/request-id';

export async function GET(request: NextRequest): Promise<NextResponse> {
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
    logRouteError('[api/admin/integrations-status]', request, e);
    return apiInternalError('Không thể kiểm tra tích hợp');
  }
}
