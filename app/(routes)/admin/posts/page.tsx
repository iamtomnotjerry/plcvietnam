import Link from 'next/link';
import type { Route } from 'next';
import { contentRepository } from '@/lib/data/factory';
import type { AdminPostStatusFilter } from '@/lib/data/repository';

export const dynamic = 'force-dynamic';

interface AdminPostsPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminPostsPage({ searchParams }: AdminPostsPageProps) {
  const sp = await searchParams;
  const statusParam = sp.status;
  const status: AdminPostStatusFilter =
    statusParam === 'draft' || statusParam === 'published' || statusParam === 'all'
      ? statusParam
      : 'all';
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);

  const result = await contentRepository.listPostsForAdmin({ status, page, limit: 20 });

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Bài viết</h1>
          <p className="text-sm text-muted-foreground">Quản lý bản nháp và bài đã xuất bản (mock).</p>
        </div>
        <Link
          href={'/admin/posts/new' as Route}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Viết bài mới
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <FilterLink href="/admin/posts?status=all" label="Tất cả" active={status === 'all'} />
        <FilterLink
          href="/admin/posts?status=published"
          label="Đã xuất bản"
          active={status === 'published'}
        />
        <FilterLink href="/admin/posts?status=draft" label="Nháp" active={status === 'draft'} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-4 py-3 font-medium">Tiêu đề</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Cập nhật</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {result.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Không có bài viết.
                </td>
              </tr>
            ) : (
              result.data.map(post => (
                <tr key={post.id} className="border-b border-border/80 last:border-0">
                  <td className="px-4 py-3 font-medium">{post.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{post.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        (post.status ?? 'published') === 'draft'
                          ? 'rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-800 dark:text-amber-200'
                          : 'rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-800 dark:text-emerald-200'
                      }
                    >
                      {(post.status ?? 'published') === 'draft' ? 'Nháp' : 'Xuất bản'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {post.updatedAt.toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/posts/${post.id}/edit` as Route}
                      className="font-medium text-primary hover:underline"
                    >
                      Sửa
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {result.pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2 text-sm">
          {Array.from({ length: result.pagination.totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/admin/posts?status=${status}&page=${p}` as Route}
              className={
                p === result.pagination.page
                  ? 'rounded-md bg-primary px-3 py-1 text-primary-foreground'
                  : 'rounded-md border border-border px-3 py-1 hover:bg-muted'
              }
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href as Route}
      className={
        active
          ? 'rounded-full bg-primary px-3 py-1 text-primary-foreground'
          : 'rounded-full border border-border bg-card px-3 py-1 text-muted-foreground hover:bg-muted'
      }
    >
      {label}
    </Link>
  );
}
