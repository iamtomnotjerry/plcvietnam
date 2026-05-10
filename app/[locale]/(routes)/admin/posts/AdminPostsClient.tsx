'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { useRouter, usePathname } from '@/i18n/navigation';
import { createColumnHelper } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import {
  CalendarClock,
  ExternalLink,
  FilePenLine,
  Globe,
  Heading,
  Link2,
  ListChecks,
  Pencil,
  Trash2,
  Wrench,
} from 'lucide-react';
import type { Post } from '@/lib/types/domain';
import type { AdminPostStatusFilter } from '@/lib/data/repository';
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
import { buildAdminPostsListQuery } from '@/lib/admin/build-admin-posts-list-query';

const columnHelper = createColumnHelper<Post>();

interface AdminPostsClientProps {
  posts: Post[];
  status: AdminPostStatusFilter;
  page: number;
  limit: number;
  totalCount: number;
  searchQuery: string;
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
}: AdminPostsClientProps) {
  const t = useTranslations('admin');
  const tDataTable = useTranslations('admin.dataTable');
  const locale = useLocale();
  const intlLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
  const router = useRouter();
  const pathname = usePathname();
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draftSearch, setDraftSearch] = useState(searchQuery);

  useEffect(() => {
    setDraftSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const qNext = draftSearch.trim() || undefined;
      const qUrl = searchQuery.trim() || undefined;
      if (qNext === qUrl) return;
      const qs = buildAdminPostsListQuery({
        status,
        page: 1,
        limit,
        q: qNext,
      });
      router.push(`${pathname}?${qs}` as Route);
    }, 350);
    return () => window.clearTimeout(id);
  }, [draftSearch, limit, pathname, router, searchQuery, status]);

  const navigateList = (next: { page?: number; limit?: number }) => {
    const qs = buildAdminPostsListQuery({
      status,
      page: next.page ?? page,
      limit: next.limit ?? limit,
      q: searchQuery || undefined,
    });
    router.push(`${pathname}?${qs}` as Route);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteState) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${deleteState.postId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || t('postsTable.deleteFailed'));
        return;
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('navigation:refresh'));
      }

      setDeleteState(null);
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert(t('deleteFailed'));
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
        cell: (info) => (
          <span className="tabular-nums text-muted-foreground">
            {info.getValue().toLocaleDateString(intlLocale)}
          </span>
        ),
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
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/admin/posts/${post.id}/edit` as Route}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                      {t('postsTable.edit')}
                    </Link>
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
      <AdminDataTable
        mode="server"
        columns={columns}
        data={posts}
        getRowId={(row) => row.id}
        className={ADMIN_DATA_TABLE_SHELL_CLASS}
        serverToolbarSearch={{
          value: draftSearch,
          onChange: setDraftSearch,
          placeholder: tDataTable('searchPlaceholder'),
          ariaLabel: tDataTable('searchAria'),
        }}
        emptyLabel={
          searchQuery.trim()
            ? t('postsTable.emptySearch', { query: searchQuery })
            : t('postsTable.empty')
        }
        serverPagination={{
          page,
          pageSize: limit,
          totalCount,
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
