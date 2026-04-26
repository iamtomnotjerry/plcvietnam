/**
 * Admin Books [id] API
 * GET    /api/admin/books/[id] - get one book
 * PATCH  /api/admin/books/[id] - update book
 * DELETE /api/admin/books/[id] - delete book
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getAdminClient();
  const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const supabase = getAdminClient();

  const updateData: Record<string, unknown> = {};
  if (body.slug !== undefined) updateData.slug = body.slug;
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.coverImageUrl !== undefined) updateData.cover_image_url = body.coverImageUrl;
  if (body.authorName !== undefined) updateData.author_name = body.authorName;
  if (body.series !== undefined) updateData.series = body.series;
  if (body.volume !== undefined) updateData.volume = body.volume;
  if (body.publisher !== undefined) updateData.publisher = body.publisher;
  if (body.publishedYear !== undefined) updateData.published_year = body.publishedYear;
  if (body.pages !== undefined) updateData.pages = body.pages;
  if (body.isbn !== undefined) updateData.isbn = body.isbn;
  if (body.downloadUrl !== undefined) updateData.download_url = body.downloadUrl;
  if (body.externalUrl !== undefined) updateData.amazon_url = body.externalUrl;
  if (body.featured !== undefined) updateData.featured = body.featured;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('books')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getAdminClient();
  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
