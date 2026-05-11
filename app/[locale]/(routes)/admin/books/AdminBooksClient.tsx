'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  BookOpen,
  Calendar,
  Heading,
  Image as ImageIcon,
  Link2,
  Pencil,
  Plus,
  Star,
  Trash2,
  User,
  Wrench,
} from 'lucide-react';
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
import { adminFetchJson } from '@/lib/admin/admin-fetch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

interface BookRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  author_name: string | null;
  series: string | null;
  volume: number | null;
  publisher: string | null;
  published_year: number | null;
  pages: number | null;
  isbn: string | null;
  download_url: string | null;
  amazon_url: string | null;
  featured: boolean;
}

interface DeleteState {
  bookId: string;
  bookTitle: string;
}

const bookColumnHelper = createColumnHelper<BookRow>();

type BookFeaturedFilter = 'all' | 'featured' | 'not_featured';

const EMPTY_FORM_BASE: Omit<BookRow, 'id'> = {
  slug: '',
  title: '',
  description: '',
  cover_image_url: '',
  author_name: '',
  series: '',
  volume: null,
  publisher: '',
  published_year: null,
  pages: null,
  isbn: '',
  download_url: '',
  amazon_url: '',
  featured: false,
};

export function AdminBooksClient() {
  const t = useTranslations('admin.books');
  const tc = useTranslations('admin.crud');
  const [books, setBooks] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<BookRow, 'id'>>(EMPTY_FORM_BASE);
  const [saving, setSaving] = useState(false);
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [featuredFilter, setFeaturedFilter] = useState<BookFeaturedFilter>('all');

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      setBooks(await adminFetchJson<BookRow[]>('/api/admin/books'));
    } catch (e) {
      setError(e instanceof Error ? e.message : tc('errUnknown'));
    } finally {
      setLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const booksForTable = useMemo(() => {
    if (featuredFilter === 'featured') return books.filter((b) => b.featured);
    if (featuredFilter === 'not_featured') return books.filter((b) => !b.featured);
    return books;
  }, [books, featuredFilter]);

  const featuredToolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <label
        className="shrink-0 text-sm font-medium text-foreground"
        htmlFor="admin-books-featured-filter"
      >
        {t('filterFeaturedLabel')}
      </label>
      <select
        id="admin-books-featured-filter"
        value={featuredFilter}
        onChange={(e) => setFeaturedFilter(e.target.value as BookFeaturedFilter)}
        className="cursor-pointer rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="all">{tc('filterAll')}</option>
        <option value="featured">{t('filterFeaturedOnly')}</option>
        <option value="not_featured">{t('filterNotFeatured')}</option>
      </select>
    </div>
  );

  function openCreate() {
    setForm({
      ...EMPTY_FORM_BASE,
      author_name: t('defaultAuthor'),
      series: t('defaultSeries'),
      publisher: t('defaultPublisher'),
    });
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(book: BookRow) {
    setForm({
      slug: book.slug,
      title: book.title,
      description: book.description ?? '',
      cover_image_url: book.cover_image_url ?? '',
      author_name: book.author_name ?? '',
      series: book.series ?? '',
      volume: book.volume,
      publisher: book.publisher ?? '',
      published_year: book.published_year,
      pages: book.pages,
      isbn: book.isbn ?? '',
      download_url: book.download_url ?? '',
      amazon_url: book.amazon_url ?? '',
      featured: book.featured,
    });
    setEditingId(book.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title || !form.slug) {
      alert(t('titleRequired'));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: form.slug,
        title: form.title,
        description: form.description || null,
        coverImageUrl: form.cover_image_url || null,
        authorName: form.author_name || t('defaultAuthor'),
        series: form.series || null,
        volume: form.volume,
        publisher: form.publisher || null,
        publishedYear: form.published_year,
        pages: form.pages,
        isbn: form.isbn || null,
        downloadUrl: form.download_url || null,
        externalUrl: form.amazon_url || null,
        featured: form.featured,
      };

      const url = editingId ? `/api/admin/books/${editingId}` : '/api/admin/books';
      const method = editingId ? 'PATCH' : 'POST';
      await adminFetchJson(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setShowForm(false);
      await fetchBooks();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('navigation:refresh'));
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : tc('errUnknown'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteState) return;

    setIsDeleting(true);
    try {
      await adminFetchJson(`/api/admin/books/${deleteState.bookId}`, { method: 'DELETE' });
      setDeleteState(null);
      await fetchBooks();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('navigation:refresh'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(t('deleteFailed'));
    } finally {
      setIsDeleting(false);
    }
  }

  function slugify(title: string) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  const columns = useMemo(
    () => [
      bookColumnHelper.display({
        id: 'cover',
        header: () => (
          <AdminTableColumnHeader icon={ImageIcon}>{t('colCover')}</AdminTableColumnHeader>
        ),
        cell: (info) => {
          const book = info.row.original;
          return (
            <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
              {book.cover_image_url ? (
                <Image
                  src={book.cover_image_url}
                  alt={book.title}
                  width={40}
                  height={56}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookOpen className="h-4 w-4 text-muted-foreground/50" aria-hidden />
                </div>
              )}
            </div>
          );
        },
      }),
      bookColumnHelper.accessor('title', {
        header: () => (
          <AdminTableColumnHeader icon={Heading}>{tc('colName')}</AdminTableColumnHeader>
        ),
        cell: (info) => {
          const book = info.row.original;
          return (
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <AdminTruncatedCell value={info.getValue()} variant="label" />
                {book.volume ? (
                  <AdminTablePill variant="primary" className="py-0.5 text-[10px] leading-tight">
                    {t('volume', { n: book.volume })}
                  </AdminTablePill>
                ) : null}
              </div>
              {book.series ? (
                <div className="mt-0.5">
                  <AdminTruncatedCell value={book.series} variant="muted" maxLength={48} />
                </div>
              ) : null}
            </div>
          );
        },
      }),
      bookColumnHelper.accessor('slug', {
        header: () => <AdminTableColumnHeader icon={Link2}>{tc('colSlug')}</AdminTableColumnHeader>,
        cell: (info) => <AdminTruncatedCell value={info.getValue()} variant="slug" />,
      }),
      bookColumnHelper.accessor('author_name', {
        header: () => (
          <AdminTableColumnHeader icon={User}>{t('labelAuthor')}</AdminTableColumnHeader>
        ),
        cell: (info) => {
          const v = info.getValue();
          return v ? (
            <AdminTruncatedCell value={v} variant="muted" />
          ) : (
            <span className="text-sm text-muted-foreground">{tc('dash')}</span>
          );
        },
      }),
      bookColumnHelper.accessor('published_year', {
        header: () => (
          <AdminTableColumnHeader icon={Calendar}>{t('labelYear')}</AdminTableColumnHeader>
        ),
        cell: (info) => (
          <span className="text-sm text-muted-foreground">{info.getValue() ?? tc('dash')}</span>
        ),
      }),
      bookColumnHelper.accessor('featured', {
        header: () => (
          <AdminTableColumnHeader icon={Star} align="right">
            {t('colFeaturedHome')}
          </AdminTableColumnHeader>
        ),
        cell: (info) => (
          <span className="block text-center text-sm text-muted-foreground">
            {info.getValue() ? '✓' : tc('dash')}
          </span>
        ),
      }),
      bookColumnHelper.display({
        id: 'actions',
        header: () => (
          <AdminTableColumnHeader icon={Wrench} align="right">
            {tc('colActions')}
          </AdminTableColumnHeader>
        ),
        cell: (info) => {
          const book = info.row.original;
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
                    onClick={() => openEdit(book)}
                  >
                    <Pencil className="h-4 w-4" />
                    {tc('edit')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
                    disabled={isDeleting}
                    onClick={() => setDeleteState({ bookId: book.id, bookTitle: book.title })}
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
        subtitle={t('pageSubtitle')}
        icon={<BookOpen className="h-6 w-6" aria-hidden />}
        action={
          <button type="button" onClick={openCreate} className={ADMIN_CMS_HERO_CTA_CLASS}>
            <Plus className="h-4 w-4" aria-hidden />
            {t('add')}
          </button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <AdminDataTable
        mode="client"
        columns={columns}
        data={booksForTable}
        getRowId={(row) => row.id}
        enableGlobalFilter
        enableSorting
        initialPageSize={10}
        emptyLabel={
          !loading && books.length > 0 && booksForTable.length === 0
            ? t('emptyFiltered')
            : t('empty')
        }
        isLoading={loading}
        toolbar={featuredToolbar}
        className={ADMIN_DATA_TABLE_SHELL_CLASS}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteState !== null}
        onClose={() => setDeleteState(null)}
        onConfirm={handleDelete}
        title={t('deleteTitle')}
        description={t('deleteDescription')}
        itemName={deleteState?.bookTitle}
        isDeleting={isDeleting}
      />

      {/* Create/Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8">
          <div className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">
                {editingId ? t('modalEdit') : t('modalCreate')}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Title + auto slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('labelTitle')}
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setForm((f) => ({ ...f, title, slug: f.slug || slugify(title) }));
                    }}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    placeholder={t('titlePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {tc('labelSlug')} *
                  </label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono"
                    placeholder={t('slugPlaceholder')}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('labelDesc')}
                </label>
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                  placeholder={t('descPlaceholder')}
                />
              </div>

              {/* Cover URL */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('labelCover')}
                </label>
                <input
                  value={form.cover_image_url ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  placeholder={t('coverPlaceholder')}
                />
              </div>

              {/* Author + Series */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('labelAuthor')}
                  </label>
                  <input
                    value={form.author_name ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('labelSeries')}
                  </label>
                  <input
                    value={form.series ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, series: e.target.value }))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Volume + Publisher + Year + Pages */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('labelVolume')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.volume ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        volume: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('labelYear')}
                  </label>
                  <input
                    type="number"
                    min={2000}
                    max={2030}
                    value={form.published_year ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        published_year: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    placeholder="2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('labelPages')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.pages ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        pages: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    placeholder="400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('labelIsbn')}
                  </label>
                  <input
                    value={form.isbn ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    placeholder={t('isbnPlaceholder')}
                  />
                </div>
              </div>

              {/* Publisher */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('labelPublisher')}
                </label>
                <input
                  value={form.publisher ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, publisher: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Download + External URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('labelPdf')}
                  </label>
                  <input
                    value={form.download_url ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, download_url: e.target.value }))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    placeholder={t('urlPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('labelBuy')}
                  </label>
                  <input
                    value={form.amazon_url ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, amazon_url: e.target.value }))}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    placeholder={t('urlPlaceholder')}
                  />
                </div>
              </div>

              {/* Featured (same pattern as admin Fields “Trang chủ”) */}
              <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                    className="mt-1 rounded border-input"
                  />
                  <span>
                    <span className="text-sm font-medium text-foreground">
                      {t('featuredCheckbox')}
                    </span>
                    <p className="mt-1 text-xs text-muted-foreground">{t('featuredHomeHint')}</p>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                {tc('cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors cursor-pointer"
              >
                {saving ? tc('saving') : editingId ? tc('update') : t('submitCreate')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
