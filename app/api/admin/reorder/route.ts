import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import { revalidatePath } from 'next/cache';

/**
 * PATCH /api/admin/reorder
 * Update order of fields, categories, or posts
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, items } = body;

    if (!type || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Update order for each item
    const updates = items.map((item: { id: string; order: number }) => {
      let table: 'fields' | 'categories' | 'posts';
      switch (type) {
        case 'field':
          table = 'fields';
          break;
        case 'category':
          table = 'categories';
          break;
        case 'post':
          table = 'posts';
          break;
        default:
          throw new Error(`Invalid type: ${type}`);
      }

      return supabase
        .from(table)
        .update({ order: item.order } as any)
        .eq('id', item.id);
    });

    await Promise.all(updates);

    // Revalidate navigation cache
    revalidatePath('/api/navigation');
    revalidatePath('/');
    revalidatePath('/posts');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/admin/reorder] Error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
