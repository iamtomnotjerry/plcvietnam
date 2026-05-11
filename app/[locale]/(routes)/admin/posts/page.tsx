import { Suspense } from 'react';
import { Newspaper, PenSquare } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { getTranslations } from 'next-intl/server';
import { contentRepository } from '@/lib/data/factory';
import type { AdminPostStatusFilter } from '@/lib/data/repository';
import { ADMIN_POSTS_LIST_DEFAULT_PAGE_SIZE } from '@/lib/admin/constants';
import { ADMIN_CMS_HERO_CTA_CLASS } from '@/features/admin/admin-table-styles';
import { AdminCmsPageHero } from '@/features/admin/components/AdminCmsPageHero';
import { AdminNewPostComposerLauncher } from '@/features/cms/components/AdminNewPostComposerLauncher';
import { loadPostEditorOptions } from '@/features/cms/utils/loadEditorOptions';
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
  const limitRaw = parseInt(sp.limit || String(ADMIN_POSTS_LIST_DEFAULT_PAGE_SIZE), 10);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(100, Math.max(1, limitRaw))
    : ADMIN_POSTS_LIST_DEFAULT_PAGE_SIZE;
  const q = typeof sp.q === 'string' ? sp.q : '';
  const search = q.trim() || undefined;

  const [result, editorOptions] = await Promise.all([
    contentRepository.listPostsForAdmin({ status, page, limit, search }),
    loadPostEditorOptions(),
  ]);
  const firstCategoryId = editorOptions.categories[0]?.id ?? '';

  return (
    <div className="space-y-8">
      <AdminCmsPageHero
        title={t('postsPage.title')}
        subtitle={t('postsPage.subtitle')}
        icon={<Newspaper className="h-6 w-6" aria-hidden />}
        action={
          <Suspense
            fallback={
              <Link href={'/admin/posts?compose=1' as Route} className={ADMIN_CMS_HERO_CTA_CLASS}>
                <PenSquare className="h-4 w-4" aria-hidden />
                {t('postsPage.newPostCta')}
              </Link>
            }
          >
            <AdminNewPostComposerLauncher
              fields={editorOptions.fields}
              categories={editorOptions.categories}
              tags={editorOptions.tags}
              ctaLabel={t('postsPage.newPostCta')}
              firstCategoryId={firstCategoryId}
            />
          </Suspense>
        }
      />

      <AdminPostsClient
        posts={result.data}
        status={status}
        page={result.pagination.page}
        limit={result.pagination.limit}
        totalCount={result.pagination.total}
        searchQuery={q}
        fields={editorOptions.fields}
        categories={editorOptions.categories}
        tags={editorOptions.tags}
      />
    </div>
  );
}
