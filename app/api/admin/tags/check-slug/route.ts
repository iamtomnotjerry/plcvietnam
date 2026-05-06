/**
 * GET /api/admin/tags/check-slug?slug=...&excludeId=...
 * Returns { available: boolean }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { apiUnauthorized } from '@/lib/api/responses';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session?.user || (role !== 'admin' && role !== 'author')) {
    return apiUnauthorized();
  }

  const slug = request.nextUrl.searchParams.get('slug')?.trim();
  const excludeId = request.nextUrl.searchParams.get('excludeId')?.trim();

  if (!slug) {
    return NextResponse.json({ available: false });
  }

  const db = getServiceClient();
  let query = db.from('tags').select('id').eq('slug', slug);
  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data } = await query.limit(1);
  return NextResponse.json({ available: !data || data.length === 0 });
}
