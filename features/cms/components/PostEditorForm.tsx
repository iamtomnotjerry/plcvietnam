'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import type { PostPublicationStatus, SEOMetadata } from '@/lib/types/domain';

export interface PostEditorCategoryOption {
  id: string;
  label: string;
}

export interface PostEditorTagOption {
  id: string;
  name: string;
}

export interface PostEditorInitial {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tagIds: string[];
  thumbnailUrl: string;
  status: PostPublicationStatus;
  seo: SEOMetadata;
}

export interface PostEditorFormProps {
  mode: 'create' | 'edit';
  initial: PostEditorInitial;
  categories: PostEditorCategoryOption[];
  tags: PostEditorTagOption[];
}

export function PostEditorForm({ mode, initial, categories, tags }: PostEditorFormProps) {
  const router = useRouter();
  const [slug, setSlug] = useState(initial.slug);
  const [title, setTitle] = useState(initial.title);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [content, setContent] = useState(initial.content);
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [tagIds, setTagIds] = useState<string[]>(initial.tagIds);
  const [thumbnailUrl, setThumbnailUrl] = useState(initial.thumbnailUrl);
  const [status, setStatus] = useState<PostPublicationStatus>(initial.status ?? 'published');
  const [seoTitle, setSeoTitle] = useState(initial.seo.title);
  const [seoDescription, setSeoDescription] = useState(initial.seo.description);
  const [seoKeywords, setSeoKeywords] = useState(initial.seo.keywords.join(', '));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleTag = (id: string) => {
    setTagIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId.trim()) {
      setError('Vui lòng chọn danh mục');
      return;
    }
    setLoading(true);
    setError(null);
    const keywords = seoKeywords
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);
    const seo: SEOMetadata = {
      title: seoTitle.trim() || title.trim(),
      description: seoDescription.trim() || excerpt.trim(),
      keywords,
    };
    const body = {
      slug,
      title,
      excerpt,
      content,
      categoryId,
      tagIds,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      status,
      seo,
    };
    try {
      const url =
        mode === 'create' ? '/api/admin/posts' : `/api/admin/posts/${initial.id}`;
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Lưu thất bại');
        return;
      }
      if (mode === 'create' && data.id) {
        router.push(`/admin/posts/${data.id}/edit` as Route);
        router.refresh();
        return;
      }
      router.push('/admin/posts' as Route);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (mode !== 'edit' || !initial.id) return;
    if (!window.confirm('Xóa bài viết này?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/posts/${initial.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === 'string' ? data.error : 'Xóa thất bại');
        return;
      }
      router.push('/admin/posts' as Route);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Tiêu đề</label>
          <input
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Slug</label>
          <input
            required
            value={slug}
            onChange={e => setSlug(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Trạng thái</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as PostPublicationStatus)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="published">Xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Danh mục</label>
          <select
            required
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">— Chọn —</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Tóm tắt</label>
          <textarea
            required
            rows={3}
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Nội dung (HTML)</label>
          <textarea
            required
            rows={14}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Ảnh thumbnail (URL, tuỳ chọn)</label>
          <input
            value={thumbnailUrl}
            onChange={e => setThumbnailUrl(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-medium">Thẻ</p>
          <div className="flex flex-wrap gap-2">
            {tags.map(t => (
              <label key={t.id} className="inline-flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={tagIds.includes(t.id)}
                  onChange={() => toggleTag(t.id)}
                />
                {t.name}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">SEO title</label>
          <input
            value={seoTitle}
            onChange={e => setSeoTitle(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">SEO description</label>
          <input
            value={seoDescription}
            onChange={e => setSeoDescription(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">SEO keywords (phân tách bằng dấu phẩy)</label>
          <input
            value={seoKeywords}
            onChange={e => setSeoKeywords(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {loading ? 'Đang lưu…' : 'Lưu'}
        </button>
        {mode === 'edit' && (
          <button
            type="button"
            disabled={loading}
            onClick={onDelete}
            className="rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive disabled:opacity-60"
          >
            Xóa bài
          </button>
        )}
      </div>
    </form>
  );
}
