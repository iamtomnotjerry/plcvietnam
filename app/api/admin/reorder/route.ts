import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/client-singleton';
import { revalidatePath } from 'next/cache';
import { apiBadRequest, apiInternalError, apiUnauthorized } from '@/lib/api/responses';
import { requireEditorAuth } from '@/lib/auth/server-auth';
import { logAdminChecklogEvent } from '@/lib/checklog/log-admin-event';

const MAX_REORDER_ITEMS = 200;

/**
 * PATCH /api/admin/reorder
 * Update order of fields, categories, or posts
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireEditorAuth();
    if (!auth) {
      return apiUnauthorized('Unauthorized');
    }

    const body: unknown = await request.json();
    const payload = body as {
      type?: 'field' | 'category' | 'post';
      items?: Array<{ id: string; order: number }>;
    };
    const { type, items } = payload;

    if (
      !type ||
      !items ||
      !Array.isArray(items) ||
      !items.every((item) => typeof item.id === 'string' && typeof item.order === 'number')
    ) {
      return apiBadRequest('Invalid request body');
    }
    if (items.length > MAX_REORDER_ITEMS) {
      return apiBadRequest(`Too many items. Maximum allowed is ${MAX_REORDER_ITEMS}`);
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
        .update({ order: item.order } as never)
        .eq('id', item.id);
    });

    const results = await Promise.all(updates);
    const failed = results.find((result) => result.error);
    if (failed?.error) {
      throw failed.error;
    }

    // Revalidate navigation cache
    revalidatePath('/api/navigation');
    revalidatePath('/');
    revalidatePath('/posts');

    logAdminChecklogEvent({
      request,
      auth,
      channel: 'navigation.reorder',
      outcome: 'success',
      metadata: { reorderType: type, itemCount: items.length },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/admin/reorder] Error:', error);
    return apiInternalError('Failed to update order');
  }
}
