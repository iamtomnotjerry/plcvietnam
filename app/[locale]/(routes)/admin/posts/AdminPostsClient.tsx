'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { useRouter, usePathname } from '@/i18n/navigation';
import { createColumnHelper } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import {
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FilePenLine,
  Globe,
  Heading,
  LayoutList,
  Link2,
  ListChecks,
  Pencil,
  Trash2,
  Wrench,
} from 'lucide-react';
import type { Post } from '@/lib/types/domain';
import type { AdminPostStatusFilter, PaginatedResult } from '@/lib/data/repository';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Button } from '@/components/ui/Button';
import {
  ADMIN_DATA_TABLE_SHELL_CLASS,
  ADMIN_ROW_ACTIONS_TRIGGER_CLASS,
} from '@/features/admin/admin-table-styles';
import { AdminDataTable } from '@/features/admin/components/AdminDataTable';
import { AdminTableColumnHeader } from '@/features/admin/components/AdminTableColumnHeader';
import { AdminTablePill } from '@/features/admin/components/AdminTablePill';
import { AdminTruncatedCell } from '@/features/admin/components/AdminTruncatedCell';
import { adminFetchJson } from '@/lib/admin/admin-fetch';
import { buildAdminPostsListQuery } from '@/lib/admin/build-admin-posts-list-query';
import { normalizePostFromJson } from '@/lib/admin/normalize-post-from-json';
import { replacePathQueryPreserving } from '@/lib/admin/replace-path-query-preserving';
import { onNavigationRefresh } from '@/lib/events/navigation';
import { PostComposerModalFrame } from '@/features/cms/components/PostComposerModalFrame';
import { PostComposerSplitWorkspace } from '@/features/cms/components/PostComposerSplitWorkspace';
import type {
  PostEditorCategoryOption,
  PostEditorFieldOption,
  PostEditorInitial,
  PostEditorTagOption,
} from '@/features/cms/components/PostEditorForm';

const columnHelper = createColumnHelper<Post>();

interface AdminPostsClientProps {
  posts: Post[];
  status: AdminPostStatusFilter;
  page: number;
  limit: number;
  totalCount: number;
  searchQuery: string;
  fields: PostEditorFieldOption[];
  categories: PostEditorCategoryOption[];
  tags: PostEditorTagOption[];
}

function postToEditorInitial(post: Post): PostEditorInitial {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    categoryId: post.categoryId,
    tagIds: post.tags.map((tag) => tag.id),
    thumbnailUrl: post.thumbnailUrl ?? '',
    status: post.status ?? 'published',
    seo: post.seo,
  };
}

interface DeleteState {
  postId: string;
  postTitle: string;
}

export function AdminPostsClient({
  posts,
  status,
  page,
  limit,
  totalCount,
  searchQuery,
  fields,
  categories,
  tags,
}: AdminPostsClientProps) {
  const t = useTranslations('admin');
  const tCms = useTranslations('admin.cms.postEditor');
  const tDataTable = useTranslations('admin.dataTable');
  const tc = useTranslations('admin.crud');
  const locale = useLocale();
  const intlLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
  const router = useRouter();
  const pathname = usePathname();
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rows, setRows] = useState(posts);
  const [filterStatus, setFilterStatus] = useState(status);
  const [listPage, setListPage] = useState(page);
  const [pageSize, setPageSize] = useState(limit);
  const [totalRows, setTotalRows] = useState(totalCount);
  const [appliedSearch, setAppliedSearch] = useState(searchQuery);
  const [draftSearch, setDraftSearch] = useState(searchQuery);
  const [listLoading, setListLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);

  const closeEditModal = useCallback(() => {
    setEditingPost(null);
  }, []);

  useEffect(() => {
    setRows(posts);
    setFilterStatus(status);
    setListPage(page);
    setPageSize(limit);
    setTotalRows(totalCount);
    setAppliedSearch(searchQuery);
    setDraftSearch(searchQuery);
  }, [posts, status, page, limit, totalCount, searchQuery]);

  useEffect(() => {
    return onNavigationRefresh(() => {
      router.refresh();
    });
  }, [router]);

  useEffect(() => {
    return () => {
      fetchAbortRef.current?.abort();
    };
  }, []);

  const runListFetch = useCallback(
    async (opts: { status: AdminPostStatusFilter; page: number; limit: number; q: string }) => {
      fetchAbortRef.current?.abort();
      const ac = new AbortController();
      fetchAbortRef.current = ac;
      const qTrim = opts.q.trim();
      const listOpts = {
        status: opts.status,
        page: opts.page,
        limit: opts.limit,
        q: qTrim || undefined,
      };
      setListLoading(true);
      try {
        const qs = buildAdminPostsListQuery(listOpts);
        const body = await adminFetchJson<PaginatedResult<Post>>(`/api/admin/posts?${qs}`, {
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;
        replacePathQueryPreserving(pathname, buildAdminPostsListQuery(listOpts), ['compose']);
        setRows(body.data.map(normalizePostFromJson));
        setFilterStatus(opts.status);
        setListPage(body.pagination.page);
        setPageSize(body.pagination.limit);
        setTotalRows(body.pagination.total);
        setAppliedSearch(qTrim);
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        console.error('[admin/posts list]', e);
        alert(e instanceof Error ? e.message : tc('errUnknown'));
        router.refresh();
      } finally {
        if (!ac.signal.aborted) setListLoading(false);
      }
    },
    [pathname, router, tc]
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      const qNext = draftSearch.trim();
      const qApplied = appliedSearch.trim();
      if (qNext === qApplied) return;
      void runListFetch({
        status: filterStatus,
        page: 1,
        limit: pageSize,
        q: draftSearch,
      });
    }, 350);
    return () => window.clearTimeout(id);
  }, [appliedSearch, draftSearch, filterStatus, pageSize, runListFetch]);

  const navigateList = (next: { page?: number; limit?: number }) => {
    void runListFetch({
      status: filterStatus,
      page: next.page ?? listPage,
      limit: next.limit ?? pageSize,
      q: appliedSearch,
    });
  };

  const changeStatusFilter = (next: AdminPostStatusFilter) => {
    if (next === filterStatus) return;
    setFilterStatus(next);
    void runListFetch({
      status: next,
      page: 1,
      limit: pageSize,
      q: appliedSearch,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteState) return;

    setIsDeleting(true);
    try {
      await adminFetchJson(`/api/admin/posts/${deleteState.postId}`, {
        method: 'DELETE',
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('navigation:refresh'));
      }

      setDeleteState(null);
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error instanceof Error ? error.message : t('postsTable.deleteFailed'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: () => (
          <AdminTableColumnHeader icon={Heading}>{t('postsTable.colTitle')}</AdminTableColumnHeader>
        ),
        cell: (info) => <AdminTruncatedCell value={info.getValue()} variant="label" />,
      }),
      columnHelper.accessor('slug', {
        header: () => (
          <AdminTableColumnHeader icon={Link2}>{t('postsTable.colSlug')}</AdminTableColumnHeader>
        ),
        cell: (info) => <AdminTruncatedCell value={info.getValue()} variant="slug" />,
      }),
      columnHelper.accessor((row) => row.status ?? 'published', {
        id: 'status',
        header: () => (
          <AdminTableColumnHeader icon={ListChecks}>
            {t('postsTable.colStatus')}
          </AdminTableColumnHeader>
        ),
        cell: (info) => {
          const st = info.getValue();
          const isDraft = st === 'draft';
          return (
            <AdminTablePill variant={isDraft ? 'warning' : 'success'}>
              {isDraft ? (
                <FilePenLine
                  className="h-3 w-3 shrink-0 text-amber-800 dark:text-amber-200"
                  aria-hidden
                />
              ) : (
                <Globe
                  className="h-3 w-3 shrink-0 text-emerald-800 dark:text-emerald-200"
                  aria-hidden
                />
              )}
              {isDraft ? t('postsTable.statusDraft') : t('postsTable.statusPublished')}
            </AdminTablePill>
          );
        },
      }),
      columnHelper.accessor('updatedAt', {
        header: () => (
          <AdminTableColumnHeader icon={CalendarClock}>
            {t('postsTable.colUpdated')}
          </AdminTableColumnHeader>
        ),
        cell: (info) => {
          const v = info.getValue() as Date | string;
          const d = v instanceof Date ? v : new Date(String(v));
          return (
            <span className="tabular-nums text-muted-foreground">
              {Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(intlLocale)}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => (
          <AdminTableColumnHeader icon={Wrench} align="right">
            {t('postsTable.colActions')}
          </AdminTableColumnHeader>
        ),
        cell: (info) => {
          const post = info.row.original;
          const fieldSlug = post.category?.field?.slug;
          const categorySlug = post.category?.slug;
          const publicHref =
            (post.status ?? 'published') === 'published' && fieldSlug && categorySlug
              ? (`/fields/${fieldSlug}/${categorySlug}/${post.slug}` as Route)
              : null;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={ADMIN_ROW_ACTIONS_TRIGGER_CLASS}
                    aria-label={t('postsTable.actionsMenuAria')}
                  >
                    <Wrench className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[11rem]">
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2"
                    onSelect={() => {
                      setEditingPost(post);
                    }}
                  >
                    <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                    {t('postsTable.edit')}
                  </DropdownMenuItem>
                  {publicHref ? (
                    <DropdownMenuItem asChild>
                      <Link
                        href={publicHref}
                        className="flex cursor-pointer items-center gap-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                        {t('postsTable.viewPublic')}
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                    onClick={() => setDeleteState({ postId: post.id, postTitle: post.title })}
                  >
                    <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                    {t('postsTable.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [t, intlLocale]
  );

  return (
    <>
      {editingPost ? (
        <PostComposerModalFrame
          title={t('postEdit.title')}
          closeLabel={tCms('composerClose')}
          onClose={closeEditModal}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted/10">
            <PostComposerSplitWorkspace
              key={editingPost.id}
              mode="edit"
              initial={postToEditorInitial(editingPost)}
              fields={fields}
              categories={categories}
              tags={tags}
              onEditSuccess={closeEditModal}
            />
          </div>
        </PostComposerModalFrame>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => changeStatusFilter('all')}
          className={
            filterStatus === 'all'
              ? 'inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25'
              : 'inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/70 hover:text-foreground'
          }
        >
          <LayoutList className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
          {t('postsPage.filterAll')}
        </button>
        <button
          type="button"
          onClick={() => changeStatusFilter('published')}
          className={
            filterStatus === 'published'
              ? 'inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25'
              : 'inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/70 hover:text-foreground'
          }
        >
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
          {t('postsPage.filterPublished')}
        </button>
        <button
          type="button"
          onClick={() => changeStatusFilter('draft')}
          className={
            filterStatus === 'draft'
              ? 'inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25'
              : 'inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3.5 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/70 hover:text-foreground'
          }
        >
          <FilePenLine className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
          {t('postsPage.filterDraft')}
        </button>
      </div>
      <AdminDataTable
        mode="server"
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        className={ADMIN_DATA_TABLE_SHELL_CLASS}
        isLoading={listLoading}
        serverToolbarSearch={{
          value: draftSearch,
          onChange: setDraftSearch,
          placeholder: tDataTable('searchPlaceholder'),
          ariaLabel: tDataTable('searchAria'),
        }}
        emptyLabel={
          appliedSearch.trim()
            ? t('postsTable.emptySearch', { query: appliedSearch.trim() })
            : t('postsTable.empty')
        }
        serverPagination={{
          page: listPage,
          pageSize,
          totalCount: totalRows,
          onPageChange: (p) => navigateList({ page: p }),
          onPageSizeChange: (size) => navigateList({ page: 1, limit: size }),
        }}
      />

      <DeleteConfirmDialog
        isOpen={deleteState !== null}
        onClose={() => setDeleteState(null)}
        onConfirm={handleDeleteConfirm}
        title={t('postsTable.deleteTitle')}
        description={t('postsTable.deleteDescription')}
        itemName={deleteState?.postTitle}
        isDeleting={isDeleting}
      />
    </>
  );
}
