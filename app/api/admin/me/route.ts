import { NextResponse } from 'next/server';
import { requireAuthenticatedAuth } from '@/lib/auth/server-auth';
import { apiUnauthorized } from '@/lib/api/responses';

export async function GET(): Promise<NextResponse> {
  const auth = await requireAuthenticatedAuth();
  if (!auth) return apiUnauthorized();
  return NextResponse.json({ role: auth.role });
}
