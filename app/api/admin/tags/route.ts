/**
 * Admin Tags API - CRUD for tags
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import { revalidatePath } from 'next/cache';

function unauthorized() {
  return NextResponse.json({ error: 'Không có quyền' }, { status: 401 });
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') return null;
  return session;
}

export async function GET(): Promise<NextResponse> {
  const db = getServiceClient();
  const { data, error } = await db.from('tags').select('*').order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) return unauthorized();

  let body: { slug?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!slug || !name) return NextResponse.json({ error: 'Thiếu slug hoặc name' }, { status: 400 });

  const db = getServiceClient();
  const { data, error } = await db.from('tags').insert({ slug, name }).select().single();
  if (error) {
    if (error.code === '23505')
      return NextResponse.json({ error: 'Slug đã tồn tại' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Revalidate tags cache
  revalidatePath('/api/tags');
  revalidatePath('/');
  
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) return unauthorized();

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });

  const db = getServiceClient();
  const { error } = await db.from('tags').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Revalidate tags cache
  revalidatePath('/api/tags');
  revalidatePath('/');
  
  return NextResponse.json({ ok: true });
}
