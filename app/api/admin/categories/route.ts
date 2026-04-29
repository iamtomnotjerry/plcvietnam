/**
 * Admin Categories API - CRUD for categories
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/lib/supabase/database.types';

function unauthorized() {
  return NextResponse.json({ error: 'Không có quyền' }, { status: 401 });
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') return null;
  return session;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const fieldId = new URL(request.url).searchParams.get('fieldId');
  const db = getServiceClient();

  let query = db.from('categories').select('*, fields(id, name, slug)').order('name');
  if (fieldId) query = query.eq('field_id', fieldId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await requireAdmin())) return unauthorized();

  let body: { slug?: string; name?: string; description?: string; fieldId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const fieldId = typeof body.fieldId === 'string' ? body.fieldId.trim() : '';

  if (!slug || !name || !fieldId) {
    return NextResponse.json({ error: 'Thiếu slug, name hoặc fieldId' }, { status: 400 });
  }

  const db = getServiceClient();
  const { data, error } = await db
    .from('categories')
    .insert({ slug, name, description: body.description ?? null, field_id: fieldId })
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

  let body: { id?: string; slug?: string; name?: string; description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  if (!body.id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });

  const update: Database['public']['Tables']['categories']['Update'] = {};
  if (body.slug) update.slug = body.slug;
  if (body.name) update.name = body.name;
  if (body.description !== undefined) update.description = body.description ?? null;

  const db = getServiceClient();
  const { data, error } = await db
    .from('categories')
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

  const db = getServiceClient();
  const { error } = await db.from('categories').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  // Revalidate navigation cache
  revalidatePath('/api/navigation');
  revalidatePath('/');
  
  return NextResponse.json({ ok: true });
}
