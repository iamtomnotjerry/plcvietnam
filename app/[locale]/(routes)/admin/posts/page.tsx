import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { getTranslations } from 'next-intl/server';
import { contentRepository } from '@/lib/data/factory';
import type { AdminPostStatusFilter } from '@/lib/data/repository';
import { AdminPostsClient } from './AdminPostsClient';

export const dynamic = 'force-dynamic';

interface AdminPostsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminPostsPage({ params, searchParams }: AdminPostsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });
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
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            {t('postsPage.title')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('postsPage.subtitle')}</p>
        </div>
        <Link
          href={'/admin/posts/new' as Route}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          {t('postsPage.newPostCta')}
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <FilterLink
          href="/admin/posts?status=all"
          label={t('postsPage.filterAll')}
          active={status === 'all'}
        />
        <FilterLink
          href="/admin/posts?status=published"
          label={t('postsPage.filterPublished')}
          active={status === 'published'}
        />
        <FilterLink
          href="/admin/posts?status=draft"
          label={t('postsPage.filterDraft')}
          active={status === 'draft'}
        />
      </div>

      <AdminPostsClient posts={result.data} />

      {result.pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2 text-sm">
          {Array.from({ length: result.pagination.totalPages }, (_, i) => i + 1).map((p) => (
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

function FilterLink({ href, label, active }: { href: string; label: string; active: boolean }) {
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
