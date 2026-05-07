/**
 * GET /api/admin/fields/check-slug?slug=...&excludeId=...
 * Returns { available: boolean }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import { apiUnauthorized } from '@/lib/api/responses';
import { requireEditorAuth } from '@/lib/auth/server-auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!(await requireEditorAuth())) {
    return apiUnauthorized();
  }

  const slug = request.nextUrl.searchParams.get('slug')?.trim();
  const excludeId = request.nextUrl.searchParams.get('excludeId')?.trim();

  if (!slug) {
    return NextResponse.json({ available: false });
  }

  const db = getServiceClient();
  let query = db.from('fields').select('id').eq('slug', slug);
  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data } = await query.limit(1);
  return NextResponse.json({ available: !data || data.length === 0 });
}
