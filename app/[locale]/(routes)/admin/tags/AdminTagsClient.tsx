'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  Hash,
  Link2,
  Newspaper,
  Pencil,
  Plus,
  Tags as TagsIcon,
  Trash2,
  Wrench,
} from 'lucide-react';
import {
  ADMIN_CMS_HERO_CTA_CLASS,
  ADMIN_DATA_TABLE_SHELL_CLASS,
  ADMIN_ROW_ACTIONS_TRIGGER_CLASS,
} from '@/features/admin/admin-table-styles';
import { adminFetchJson } from '@/lib/admin/admin-fetch';
import { AdminCmsPageHero } from '@/features/admin/components/AdminCmsPageHero';
import { AdminDataTable } from '@/features/admin/components/AdminDataTable';
import { AdminTableColumnHeader } from '@/features/admin/components/AdminTableColumnHeader';
import { AdminTablePill } from '@/features/admin/components/AdminTablePill';
import { AdminTruncatedCell } from '@/features/admin/components/AdminTruncatedCell';
import { Button } from '@/components/ui/Button';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

interface Tag {
  id: string;
  slug: string;
  name: string;
  post_count: number;
}

interface DeleteState {
  tagId: string;
  tagName: string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken';

const tagColumnHelper = createColumnHelper<Tag>();

export function AdminTagsClient() {
  const t = useTranslations('admin.tags');
  const tc = useTranslations('admin.crud');
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminFetchJson<Tag[]>('/api/admin/tags');
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : tc('errUnknown'));
    } finally {
      setIsLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Check slug availability
  const checkSlug = useCallback(
    async (slug: string) => {
      if (!slug.trim()) {
        setSlugStatus('idle');
        return;
      }
      setSlugStatus('checking');
      await new Promise((resolve) => setTimeout(resolve, 400));
      try {
        const params = new URLSearchParams({ slug });
        if (editingTag?.id) params.append('excludeId', editingTag.id);
        const data = await adminFetchJson<{ available: boolean }>(
          `/api/admin/tags/check-slug?${params}`
        );
        setSlugStatus(data.available ? 'available' : 'taken');
      } catch {
        setSlugStatus('idle');
      }
    },
    [editingTag?.id]
  );

  // Check slug whenever it changes
  useEffect(() => {
    if (formSlug) checkSlug(formSlug);
    else setSlugStatus('idle');
  }, [formSlug, checkSlug]);

  function openCreate() {
    setEditingTag(null);
    setFormName('');
    setFormSlug('');
    setSlugStatus('idle');
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(tag: Tag) {
    setEditingTag(tag);
    setFormName(tag.name);
    setFormSlug(tag.slug);
    setSlugStatus('idle');
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingTag(null);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!formName.trim() || !formSlug.trim()) {
      setFormError(tc('errNameSlugRequired'));
      return;
    }
    if (slugStatus === 'taken') {
      setFormError(tc('errSlugTakenForm'));
      return;
    }
    setIsSaving(true);
    try {
      const body = {
        id: editingTag?.id,
        name: formName.trim(),
        slug: formSlug.trim(),
      };
      await adminFetchJson('/api/admin/tags', {
        method: editingTag ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      closeForm();
      fetchTags();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('navigation:refresh'));
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : tc('errUnknown'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteState) return;

    setIsDeleting(true);
    try {
      await adminFetchJson(`/api/admin/tags?id=${deleteState.tagId}`, { method: 'DELETE' });
      setDeleteState(null);
      fetchTags();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('navigation:refresh'));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : tc('alertDeleteError'));
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = useMemo(
    () => [
      tagColumnHelper.accessor('name', {
        header: () => (
          <AdminTableColumnHeader icon={Hash}>{t('colTagName')}</AdminTableColumnHeader>
        ),
        cell: (info) => (
          <AdminTablePill variant="neutral">
            <AdminTruncatedCell value={`#${info.getValue()}`} variant="slug" maxLength={28} />
          </AdminTablePill>
        ),
      }),
      tagColumnHelper.accessor('slug', {
        header: () => <AdminTableColumnHeader icon={Link2}>{tc('colSlug')}</AdminTableColumnHeader>,
        cell: (info) => <AdminTruncatedCell value={info.getValue()} variant="slug" />,
      }),
      tagColumnHelper.accessor('post_count', {
        header: () => (
          <AdminTableColumnHeader icon={Newspaper} align="right">
            {tc('colPosts')}
          </AdminTableColumnHeader>
        ),
        cell: (info) => (
          <span className="block text-right tabular-nums text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      tagColumnHelper.display({
        id: 'actions',
        header: () => (
          <AdminTableColumnHeader icon={Wrench} align="right">
            {tc('colActions')}
          </AdminTableColumnHeader>
        ),
        cell: (info) => {
          const tag = info.row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={ADMIN_ROW_ACTIONS_TRIGGER_CLASS}
                    aria-label={tc('rowActionsAria')}
                  >
                    <Wrench className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[11rem]">
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2"
                    onClick={() => openEdit(tag)}
                  >
                    <Pencil className="h-4 w-4" />
                    {tc('edit')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                    disabled={isDeleting}
                    onClick={() => setDeleteState({ tagId: tag.id, tagName: tag.name })}
                  >
                    <Trash2 className="h-4 w-4" />
                    {tc('delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [t, tc, isDeleting]
  );

  return (
    <div className="space-y-8">
      <AdminCmsPageHero
        title={t('title')}
        subtitle={t('subtitle')}
        icon={<TagsIcon className="h-6 w-6" aria-hidden />}
        action={
          <button type="button" onClick={openCreate} className={ADMIN_CMS_HERO_CTA_CLASS}>
            <Plus className="h-4 w-4" aria-hidden />
            {t('add')}
          </button>
        }
      />

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <AdminDataTable
        mode="client"
        columns={columns}
        data={tags}
        getRowId={(row) => row.id}
        enableGlobalFilter
        enableSorting
        initialPageSize={10}
        emptyLabel={t('empty')}
        isLoading={isLoading}
        className={ADMIN_DATA_TABLE_SHELL_CLASS}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteState !== null}
        onClose={() => setDeleteState(null)}
        onConfirm={handleDelete}
        title={t('deleteTitle')}
        description={t('deleteDescription')}
        itemName={deleteState?.tagName}
        isDeleting={isDeleting}
      />

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeForm} aria-hidden="true" />
          <div className="relative w-full max-w-sm rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">
                {editingTag ? t('modalEdit') : t('modalCreate')}
              </h2>
              <button
                onClick={closeForm}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label={tc('closeAria')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="tag-name">
                  {t('labelName')} <span className="text-destructive">*</span>
                </label>
                <input
                  id="tag-name"
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingTag) setFormSlug(slugify(e.target.value));
                  }}
                  placeholder={t('namePlaceholder')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="tag-slug">
                  {tc('labelSlug')} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    id="tag-slug"
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder={t('slugPlaceholder')}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring pr-10"
                    required
                  />
                  {slugStatus === 'checking' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  )}
                  {slugStatus === 'available' && (
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {slugStatus === 'taken' && (
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
                {slugStatus === 'taken' && (
                  <p className="text-xs text-destructive">{tc('slugTakenInline')}</p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  {tc('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSaving ? tc('saving') : editingTag ? tc('update') : t('submitCreate')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
