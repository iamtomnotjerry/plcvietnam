'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  AlignLeft,
  FolderTree,
  Heading,
  Link2,
  Newspaper,
  Pencil,
  Plus,
  Shapes,
  Trash2,
  Wrench,
} from 'lucide-react';
import { adminFetchJson } from '@/lib/admin/admin-fetch';
import { triggerNavigationRefresh } from '@/lib/events/navigation';
import {
  ADMIN_CMS_HERO_CTA_CLASS,
  ADMIN_DATA_TABLE_SHELL_CLASS,
  ADMIN_ROW_ACTIONS_TRIGGER_CLASS,
} from '@/features/admin/admin-table-styles';
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

interface Field {
  id: string;
  slug: string;
  name: string;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  field_id: string | null;
  post_count: number;
  fields?: { id: string; name: string; slug: string } | null;
}

interface DeleteState {
  categoryId: string;
  categoryName: string;
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

const categoryColumnHelper = createColumnHelper<Category>();

export function AdminCategoriesClient() {
  const t = useTranslations('admin.categories');
  const tc = useTranslations('admin.crud');
  const [categories, setCategories] = useState<Category[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterFieldId, setFilterFieldId] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [formDescription, setFormDescription] = useState('');
  const [formFieldId, setFormFieldId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [catData, fieldData] = await Promise.all([
        adminFetchJson<Category[]>(
          `/api/admin/categories${filterFieldId ? `?fieldId=${filterFieldId}` : ''}`
        ),
        adminFetchJson<Field[]>('/api/admin/fields'),
      ]);
      setCategories(catData);
      setFields(fieldData);
    } catch (err) {
      setError(err instanceof Error ? err.message : tc('errUnknown'));
    } finally {
      setIsLoading(false);
    }
  }, [filterFieldId, tc]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        if (editingCategory?.id) params.append('excludeId', editingCategory.id);
        const data = await adminFetchJson<{ available: boolean }>(
          `/api/admin/categories/check-slug?${params}`
        );
        setSlugStatus(data.available ? 'available' : 'taken');
      } catch {
        setSlugStatus('idle');
      }
    },
    [editingCategory?.id]
  );

  // Check slug whenever it changes
  useEffect(() => {
    if (formSlug) checkSlug(formSlug);
    else setSlugStatus('idle');
  }, [formSlug, checkSlug]);

  function openCreate() {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setSlugStatus('idle');
    setFormDescription('');
    setFormFieldId(filterFieldId || (fields[0]?.id ?? ''));
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setSlugStatus('idle');
    setFormDescription(cat.description ?? '');
    setFormFieldId(cat.field_id ?? '');
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingCategory(null);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!formName.trim() || !formSlug.trim() || !formFieldId) {
      setFormError(tc('errCategoryFieldRequired'));
      return;
    }
    if (slugStatus === 'taken') {
      setFormError(tc('errSlugTakenForm'));
      return;
    }
    setIsSaving(true);
    try {
      const body = {
        id: editingCategory?.id,
        name: formName.trim(),
        slug: formSlug.trim(),
        description: formDescription.trim() || null,
        fieldId: formFieldId,
      };
      await adminFetchJson('/api/admin/categories', {
        method: editingCategory ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      closeForm();
      fetchData();
      triggerNavigationRefresh();
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
      await adminFetchJson(`/api/admin/categories?id=${deleteState.categoryId}`, {
        method: 'DELETE',
      });
      setDeleteState(null);
      fetchData();
      triggerNavigationRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : tc('alertDeleteError'));
    } finally {
      setIsDeleting(false);
    }
  }

  const fieldFilterToolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <label
        className="shrink-0 text-sm font-medium text-foreground"
        htmlFor="admin-cat-field-filter"
      >
        {t('filterLabel')}
      </label>
      <select
        id="admin-cat-field-filter"
        value={filterFieldId}
        onChange={(e) => setFilterFieldId(e.target.value)}
        className="cursor-pointer rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">{tc('filterAll')}</option>
        {fields.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </div>
  );

  const columns = useMemo(
    () => [
      categoryColumnHelper.accessor('name', {
        header: () => (
          <AdminTableColumnHeader icon={Heading}>{tc('colName')}</AdminTableColumnHeader>
        ),
        cell: (info) => <AdminTruncatedCell value={info.getValue()} variant="label" />,
      }),
      categoryColumnHelper.accessor('slug', {
        header: () => <AdminTableColumnHeader icon={Link2}>{tc('colSlug')}</AdminTableColumnHeader>,
        cell: (info) => <AdminTruncatedCell value={info.getValue()} variant="slug" />,
      }),
      categoryColumnHelper.accessor((row) => row.fields?.name ?? '', {
        id: 'fieldName',
        header: () => (
          <AdminTableColumnHeader icon={Shapes}>{tc('colField')}</AdminTableColumnHeader>
        ),
        cell: (info) => {
          const cat = info.row.original;
          return cat.fields ? (
            <AdminTablePill variant="primary">
              <AdminTruncatedCell value={cat.fields.name} variant="label" maxLength={32} />
            </AdminTablePill>
          ) : (
            <span className="text-muted-foreground">{tc('dash')}</span>
          );
        },
      }),
      categoryColumnHelper.accessor('description', {
        header: () => (
          <AdminTableColumnHeader icon={AlignLeft}>{tc('colDesc')}</AdminTableColumnHeader>
        ),
        cell: (info) => {
          const v = info.getValue();
          if (v == null || v === '')
            return <span className="text-sm text-muted-foreground">{tc('dash')}</span>;
          return <AdminTruncatedCell value={v} variant="description" />;
        },
      }),
      categoryColumnHelper.accessor('post_count', {
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
      categoryColumnHelper.display({
        id: 'actions',
        header: () => (
          <AdminTableColumnHeader icon={Wrench} align="right">
            {tc('colActions')}
          </AdminTableColumnHeader>
        ),
        cell: (info) => {
          const cat = info.row.original;
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
                    onClick={() => openEdit(cat)}
                  >
                    <Pencil className="h-4 w-4" />
                    {tc('edit')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                    disabled={isDeleting}
                    onClick={() => setDeleteState({ categoryId: cat.id, categoryName: cat.name })}
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
    [tc, isDeleting]
  );

  return (
    <div className="space-y-8">
      <AdminCmsPageHero
        title={t('title')}
        subtitle={t('subtitle')}
        icon={<FolderTree className="h-6 w-6" aria-hidden />}
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
        data={categories}
        getRowId={(row) => row.id}
        enableGlobalFilter
        enableSorting
        initialPageSize={10}
        emptyLabel={t('empty')}
        isLoading={isLoading}
        toolbar={fieldFilterToolbar}
        className={ADMIN_DATA_TABLE_SHELL_CLASS}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteState !== null}
        onClose={() => setDeleteState(null)}
        onConfirm={handleDelete}
        title={t('deleteTitle')}
        description={t('deleteDescription')}
        itemName={deleteState?.categoryName}
        isDeleting={isDeleting}
      />

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeForm} aria-hidden="true" />
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">
                {editingCategory ? t('modalEdit') : t('modalCreate')}
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
                <label className="text-sm font-medium text-foreground" htmlFor="cat-field">
                  {t('labelField')} <span className="text-destructive">*</span>
                </label>
                <select
                  id="cat-field"
                  value={formFieldId}
                  onChange={(e) => setFormFieldId(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                  required
                >
                  <option value="">{t('selectField')}</option>
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="cat-name">
                  {t('labelName')} <span className="text-destructive">*</span>
                </label>
                <input
                  id="cat-name"
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingCategory) setFormSlug(slugify(e.target.value));
                  }}
                  placeholder={t('namePlaceholder')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="cat-slug">
                  {tc('labelSlug')} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    id="cat-slug"
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
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="cat-desc">
                  {tc('colDesc')}
                </label>
                <textarea
                  id="cat-desc"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={t('descPlaceholder')}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
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
                  {isSaving ? tc('saving') : editingCategory ? tc('update') : tc('addNew')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
