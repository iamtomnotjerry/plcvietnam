import type { AdminPostStatusFilter } from '@/lib/data/repository';

export function buildAdminPostsListQuery(opts: {
  status: AdminPostStatusFilter;
  page: number;
  limit: number;
  q?: string;
  /** UUID — optional scoped list (e.g. admin reorder). */
  categoryId?: string;
  /** Sets `for_reorder=1` — server allows higher `limit` when paired with `category_id`. */
  forReorder?: boolean;
}): string {
  const params = new URLSearchParams();
  if (opts.status !== 'all') params.set('status', opts.status);
  if (opts.q?.trim()) params.set('q', opts.q.trim());
  if (opts.categoryId?.trim()) params.set('category_id', opts.categoryId.trim());
  if (opts.forReorder) params.set('for_reorder', '1');
  params.set('page', String(opts.page));
  params.set('limit', String(opts.limit));
  return params.toString();
}
