'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { triggerNavigationRefresh } from '@/lib/events/navigation';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

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
      const [catRes, fieldRes] = await Promise.all([
        fetch(`/api/admin/categories${filterFieldId ? `?fieldId=${filterFieldId}` : ''}`),
        fetch('/api/admin/fields'),
      ]);
      if (!catRes.ok) throw new Error(t('loadCategoriesFailed'));
      if (!fieldRes.ok) throw new Error(t('loadFieldsFailed'));
      const [catData, fieldData] = await Promise.all([catRes.json(), fieldRes.json()]);
      setCategories(catData);
      setFields(fieldData);
    } catch (err) {
      setError(err instanceof Error ? err.message : tc('errUnknown'));
    } finally {
      setIsLoading(false);
    }
  }, [filterFieldId, t, tc]);

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
        const res = await fetch(`/api/admin/categories/check-slug?${params}`);
        const data = await res.json();
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
      const res = await fetch('/api/admin/categories', {
        method: editingCategory ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? tc('errSave'));
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
      const res = await fetch(`/api/admin/categories?id=${deleteState.categoryId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? tc('errCannotDelete'));
      }
      setDeleteState(null);
      fetchData();
      triggerNavigationRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : tc('alertDeleteError'));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('add')}
        </button>
      </div>

      {/* Filter by field */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground shrink-0">{t('filterLabel')}</label>
        <select
          value={filterFieldId}
          onChange={(e) => setFilterFieldId(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
        >
          <option value="">{tc('filterAll')}</option>
          {fields.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-sm">{t('empty')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {tc('colName')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {tc('colSlug')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {tc('colField')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {tc('colDesc')}
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  {tc('colPosts')}
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  {tc('colActions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{cat.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cat.slug}</td>
                  <td className="px-4 py-3">
                    {cat.fields ? (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {cat.fields.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{tc('dash')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                    {cat.description ?? tc('dash')}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{cat.post_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="rounded-md px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        {tc('edit')}
                      </button>
                      <button
                        onClick={() =>
                          setDeleteState({ categoryId: cat.id, categoryName: cat.name })
                        }
                        disabled={isDeleting}
                        className="rounded-md px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {tc('delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
