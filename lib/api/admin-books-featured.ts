import { HOMEPAGE_FEATURED_BOOKS_LIMIT } from '@/lib/data/homepage-featured-books';
import { getServiceClient } from '@/lib/supabase/client-singleton';

export async function countBooksFeaturedExcluding(excludeId?: string): Promise<number> {
  const db = getServiceClient();
  let q = db.from('books').select('id', { count: 'exact', head: true }).eq('featured', true);
  if (excludeId) q = q.neq('id', excludeId);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

export function featuredBooksCapErrorMessage(): string {
  return `Đã đủ ${HOMEPAGE_FEATURED_BOOKS_LIMIT} sách nổi bật trên trang chủ. Bỏ chọn một cuốn khác trước.`;
}
