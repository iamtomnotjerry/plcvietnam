'use client';

import { useState, useEffect, useCallback } from 'react';

interface Tag {
  id: string;
  slug: string;
  name: string;
  post_count: number;
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

export function AdminTagsClient() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState('');

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/tags');
      if (!res.ok) throw new Error('Không thể tải danh sách thẻ');
      const data = await res.json();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  function openCreate() {
    setFormName('');
    setFormSlug('');
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!formName.trim() || !formSlug.trim()) {
      setFormError('Tên và slug không được để trống');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName.trim(), slug: formSlug.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Lỗi lưu dữ liệu');
      closeForm();
      fetchTags();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/tags?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Không thể xóa');
      }
      setDeletingId(null);
      fetchTags();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi xóa');
    }
  }

  const filteredTags = search.trim()
    ? tags.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.slug.toLowerCase().includes(search.toLowerCase())
      )
    : tags;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thẻ (Tags)</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý các thẻ gắn với bài viết</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm thẻ
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm thẻ..."
          className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Tags grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          <p className="text-sm">
            {search ? `Không tìm thấy thẻ "${search}"` : 'Chưa có thẻ nào.'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tên thẻ</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Bài viết</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTags.map((tag) => (
                <tr key={tag.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                      #{tag.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tag.slug}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{tag.post_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {deletingId === tag.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(tag.id)}
                            className="rounded-md px-3 py-1.5 text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer"
                          >
                            Xác nhận xóa
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(tag.id)}
                          className="rounded-md px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeForm} aria-hidden="true" />
          <div className="relative w-full max-w-sm rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold text-foreground">Thêm thẻ mới</h2>
              <button
                onClick={closeForm}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Đóng"
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
                  Tên thẻ <span className="text-destructive">*</span>
                </label>
                <input
                  id="tag-name"
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    setFormSlug(slugify(e.target.value));
                  }}
                  placeholder="VD: Ladder Logic, TIA Portal..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="tag-slug">
                  Slug <span className="text-destructive">*</span>
                </label>
                <input
                  id="tag-slug"
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="vd: ladder-logic"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSaving ? 'Đang lưu...' : 'Thêm thẻ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
