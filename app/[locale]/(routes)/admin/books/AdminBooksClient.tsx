'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

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

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/books');
      if (!res.ok) throw new Error(t('loadFailed'));
      setBooks(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : tc('errUnknown'));
    } finally {
      setLoading(false);
    }
  }, [t, tc]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

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
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? t('saveFailed'));
      }

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
      const res = await fetch(`/api/admin/books/${deleteState.bookId}`, { method: 'DELETE' });
      if (!res.ok) {
        alert(t('deleteFailed'));
        return;
      }
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

  if (loading) return <div className="animate-pulse h-64 rounded-xl bg-muted" />;
  if (error) return <div className="text-destructive p-4">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('count', { count: books.length })}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('add')}
        </button>
      </div>

      {/* Book list */}
      <div className="space-y-3">
        {books.map((book) => (
          <div
            key={book.id}
            className="flex gap-4 items-start bg-card border border-border rounded-xl p-4"
          >
            {/* Cover */}
            <div className="flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden bg-muted">
              {book.cover_image_url ? (
                <Image
                  src={book.cover_image_url}
                  alt={book.title}
                  width={64}
                  height={80}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-muted-foreground/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground text-sm">{book.title}</h3>
                {book.volume && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    {t('volume', { n: book.volume })}
                  </span>
                )}
                {book.featured && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                    {t('featured')}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {book.author_name} · {book.published_year ?? tc('dash')} ·{' '}
                {book.pages ? t('pagesUnit', { n: book.pages }) : tc('dash')}
              </p>
              {book.series && (
                <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">{book.series}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => openEdit(book)}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                {tc('edit')}
              </button>
              <button
                onClick={() => setDeleteState({ bookId: book.id, bookTitle: book.title })}
                disabled={isDeleting}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tc('delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

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

              {/* Featured */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  className="w-4 h-4 rounded border-input accent-primary"
                />
                <span className="text-sm font-medium text-foreground">{t('featuredCheckbox')}</span>
              </label>
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
