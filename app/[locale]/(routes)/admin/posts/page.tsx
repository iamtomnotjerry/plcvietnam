import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, FilePenLine, LayoutList, Newspaper, PenSquare } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { getTranslations } from 'next-intl/server';
import { contentRepository } from '@/lib/data/factory';
import type { AdminPostStatusFilter } from '@/lib/data/repository';
import { ADMIN_CMS_HERO_CTA_CLASS } from '@/features/admin/admin-table-styles';
import { AdminCmsPageHero } from '@/features/admin/components/AdminCmsPageHero';
import { buildAdminPostsListQuery } from '@/lib/admin/build-admin-posts-list-query';
import { AdminPostsClient } from './AdminPostsClient';

export const dynamic = 'force-dynamic';

interface AdminPostsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; page?: string; limit?: string; q?: string }>;
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
  const limitRaw = parseInt(sp.limit || '10', 10);
  const limit = Number.isFinite(limitRaw) ? Math.min(100, Math.max(1, limitRaw)) : 10;
  const q = typeof sp.q === 'string' ? sp.q : '';
  const search = q.trim() || undefined;

  const result = await contentRepository.listPostsForAdmin({ status, page, limit, search });

  const filterHref = (nextStatus: AdminPostStatusFilter) =>
    `/admin/posts?${buildAdminPostsListQuery({
      status: nextStatus,
      page: 1,
      limit,
      q: search,
    })}` as Route;

  return (
    <div className="space-y-8">
      <AdminCmsPageHero
        title={t('postsPage.title')}
        subtitle={t('postsPage.subtitle')}
        icon={<Newspaper className="h-6 w-6" aria-hidden />}
        action={
          <Link href={'/admin/posts/new' as Route} className={ADMIN_CMS_HERO_CTA_CLASS}>
            <PenSquare className="h-4 w-4" aria-hidden />
            {t('postsPage.newPostCta')}
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        <FilterLink
          href={filterHref('all')}
          label={t('postsPage.filterAll')}
          active={status === 'all'}
          icon={LayoutList}
        />
        <FilterLink
          href={filterHref('published')}
          label={t('postsPage.filterPublished')}
          active={status === 'published'}
          icon={CheckCircle2}
        />
        <FilterLink
          href={filterHref('draft')}
          label={t('postsPage.filterDraft')}
          active={status === 'draft'}
          icon={FilePenLine}
        />
      </div>

      <AdminPostsClient
        posts={result.data}
        status={status}
        page={result.pagination.page}
        limit={result.pagination.limit}
        totalCount={result.pagination.total}
        searchQuery={q}
      />
    </div>
  );
}

function FilterLink({
  href,
  label,
  active,
  icon: Icon,
}: {
  href: Route;
  label: string;
  active: boolean;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? 'inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25'
          : 'inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/70 hover:text-foreground'
      }
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
      {label}
    </Link>
  );
}
