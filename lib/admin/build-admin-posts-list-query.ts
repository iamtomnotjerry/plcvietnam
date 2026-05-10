import type { AdminPostStatusFilter } from '@/lib/data/repository';

export function buildAdminPostsListQuery(opts: {
  status: AdminPostStatusFilter;
  page: number;
  limit: number;
  q?: string;
}): string {
  const params = new URLSearchParams();
  if (opts.status !== 'all') params.set('status', opts.status);
  if (opts.q?.trim()) params.set('q', opts.q.trim());
  params.set('page', String(opts.page));
  params.set('limit', String(opts.limit));
  return params.toString();
}
