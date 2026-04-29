/**
 * Admin Fields API - CRUD for fields (lĩnh vực)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/lib/supabase/database.types';

function getAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

function unauthorized() {
  return NextResponse.json({ error: 'Không có quyền' }, { status: 401 });
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') return null;
  return session;
}

export async function GET(): Promise<NextResponse> {
  const db = getAdminClient();
  const { data, error } = await db.from('fields').select('*').order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) return unauthorized();

  let body: { slug?: string; name?: string; description?: string; icon?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!slug || !name) return NextResponse.json({ error: 'Thiếu slug hoặc name' }, { status: 400 });

  const db = getAdminClient();
  const { data, error } = await db
    .from('fields')
    .insert({ slug, name, description: body.description ?? null, icon: body.icon ?? null })
    .select()
    .single();

  if (error) {
    if (error.code === '23505')
      return NextResponse.json({ error: 'Slug đã tồn tại' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Revalidate navigation cache
  revalidatePath('/api/navigation');
  revalidatePath('/');
  
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) return unauthorized();

  let body: { id?: string; slug?: string; name?: string; description?: string; icon?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  if (!body.id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });

  const update: Database['public']['Tables']['fields']['Update'] = {};
  if (body.slug) update.slug = body.slug;
  if (body.name) update.name = body.name;
  if (body.description !== undefined) update.description = body.description ?? null;
  if (body.icon !== undefined) update.icon = body.icon ?? null;

  const db = getAdminClient();
  const { data, error } = await db
    .from('fields')
    .update(update)
    .eq('id', body.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Revalidate navigation cache
  revalidatePath('/api/navigation');
  revalidatePath('/');
  
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) return unauthorized();

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });

  const db = getAdminClient();
  const { error } = await db.from('fields').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Revalidate navigation cache
  revalidatePath('/api/navigation');
  revalidatePath('/');
  
  return NextResponse.json({ ok: true });
}
