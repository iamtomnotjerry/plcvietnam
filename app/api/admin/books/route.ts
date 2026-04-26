/**
 * Admin Books API
 * GET  /api/admin/books - list all books
 * POST /api/admin/books - create a book
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

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('volume', { ascending: true, nullsFirst: false })
    .order('title', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('books')
    .insert({
      slug: body.slug,
      title: body.title,
      description: body.description ?? null,
      cover_image_url: body.coverImageUrl ?? null,
      author_name: body.authorName ?? 'Trần Văn Hiếu',
      series: body.series ?? null,
      volume: body.volume ?? null,
      publisher: body.publisher ?? null,
      published_year: body.publishedYear ?? null,
      pages: body.pages ?? null,
      isbn: body.isbn ?? null,
      download_url: body.downloadUrl ?? null,
      amazon_url: body.externalUrl ?? null,
      featured: body.featured ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
