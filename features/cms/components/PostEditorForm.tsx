'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Route } from 'next';
import type { PostPublicationStatus, SEOMetadata } from '@/lib/types/domain';

export interface PostEditorCategoryOption {
  id: string;
  label: string;
  fieldId: string;
}

export interface PostEditorTagOption {
  id: string;
  name: string;
}

export interface PostEditorFieldOption {
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
  fields: PostEditorFieldOption[];
  categories: PostEditorCategoryOption[];
  tags: PostEditorTagOption[];
}

// Convert Vietnamese title → URL-safe slug
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken';

export function PostEditorForm({ mode, initial, fields, categories, tags }: PostEditorFormProps) {
  const t = useTranslations('admin.cms.postEditor');
  const tCrud = useTranslations('admin.crud');
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

  // Derive initial fieldId from the initial categoryId
  const initialFieldId = categories.find((c) => c.id === initial.categoryId)?.fieldId ?? '';
  const [fieldId, setFieldId] = useState(initialFieldId || (fields[0]?.id ?? ''));

  // Categories filtered by selected field
  const filteredCategories = categories.filter((c) => c.fieldId === fieldId);

  // When field changes, reset categoryId to first category of new field
  const handleFieldChange = (newFieldId: string) => {
    setFieldId(newFieldId);
    const first = categories.find((c) => c.fieldId === newFieldId);
    setCategoryId(first?.id ?? '');
  };

  // Slug check state
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [slugEdited, setSlugEdited] = useState(mode === 'edit'); // in edit mode slug is pre-set
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-generate slug from title (create mode only, until user manually edits slug)
  useEffect(() => {
    if (mode === 'create' && !slugEdited && title) {
      setSlug(toSlug(title));
    }
  }, [title, mode, slugEdited]);

  // Debounced slug availability check
  const checkSlug = useCallback(
    (value: string) => {
      if (!value) {
        setSlugStatus('idle');
        return;
      }
      setSlugStatus('checking');
      if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
      checkTimerRef.current = setTimeout(async () => {
        try {
          const params = new URLSearchParams({ slug: value });
          if (initial.id) params.set('excludeId', initial.id);
          const res = await fetch(`/api/admin/posts/check-slug?${params}`);
          const data = await res.json();
          setSlugStatus(data.available ? 'available' : 'taken');
        } catch {
          setSlugStatus('idle');
        }
      }, 400);
    },
    [initial.id]
  );

  // Check slug whenever it changes
  useEffect(() => {
    if (slug) checkSlug(slug);
    else setSlugStatus('idle');
  }, [slug, checkSlug]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugEdited(true);
    setSlug(e.target.value);
  };

  const toggleTag = (id: string) => {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId.trim()) {
      setError(t('errorCategoryRequired'));
      return;
    }
    if (slugStatus === 'taken') {
      setError(t('slugTaken'));
      return;
    }
    setLoading(true);
    setError(null);
    const keywords = seoKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    const seo: SEOMetadata = {
      title: seoTitle.trim() || title.trim(),
      description: seoDescription.trim() || excerpt.trim(),
      keywords,
    };
    const body = {
      ...(mode === 'edit' && initial.id ? { id: initial.id } : {}),
      slug,
      title,
      excerpt,
      content,
      category_id: categoryId,
      tag_ids: tagIds,
      thumbnail_url: thumbnailUrl.trim() || undefined,
      status,
      meta_title: seo.title,
      meta_description: seo.description,
      meta_keywords: keywords,
    };
    try {
      const url = mode === 'create' ? '/api/admin/posts' : `/api/admin/posts/${initial.id}`;
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : t('saveFailed'));
        return;
      }

      // Trigger navigation refresh to update post counts in sidebar
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('navigation:refresh');
        window.dispatchEvent(event);
      }

      // Redirect logic:
      // - Create mode: Always go to posts list to see the new post
      // - Edit mode + Draft: Stay on edit page to continue editing
      // - Edit mode + Published: Can go to public page
      if (mode === 'create') {
        // After creating, go to posts list
        router.push('/admin/posts' as Route);
      } else if (data.status === 'draft') {
        // Draft in edit mode - stay on edit page
        if (data.id) {
          router.push(`/admin/posts/${data.id}/edit` as Route);
        } else {
          router.push('/admin/posts' as Route);
        }
      } else {
        // Published post in edit mode - can go to public page
        const postSlug = data.slug;
        const fieldSlug = data.category?.field?.slug;
        const categorySlug = data.category?.slug;

        if (postSlug && fieldSlug && categorySlug) {
          router.push(`/fields/${fieldSlug}/${categorySlug}/${postSlug}` as Route);
        } else {
          router.push('/admin/posts' as Route);
        }
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (mode !== 'edit' || !initial.id) return;
    if (!window.confirm(t('deleteConfirm'))) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/posts/${initial.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === 'string' ? data.error : t('deleteFailed'));
        return;
      }
      router.push('/admin/posts' as Route);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  // Slug status indicator
  const slugIndicator = () => {
    if (!slug) return null;
    if (slugStatus === 'checking') {
      return (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {t('slugChecking')}
        </span>
      );
    }
    if (slugStatus === 'available') {
      return (
        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {t('slugAvailable')}
        </span>
      );
    }
    if (slugStatus === 'taken') {
      return (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          {t('slugTakenShort')}
        </span>
      );
    }
    return null;
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
          <label className="mb-1 block text-sm font-medium">{t('labelTitle')}</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Slug field with live check */}
        <div>
          <label className="mb-1 block text-sm font-medium">{tCrud('labelSlug')}</label>
          <input
            required
            value={slug}
            onChange={handleSlugChange}
            className={`w-full rounded-lg border px-3 py-2 font-mono text-sm bg-background transition-colors ${
              slugStatus === 'taken'
                ? 'border-destructive focus:ring-destructive/50'
                : slugStatus === 'available'
                  ? 'border-emerald-500 focus:ring-emerald-500/50'
                  : 'border-input'
            }`}
          />
          <div className="mt-1 h-4">{slugIndicator()}</div>
          {mode === 'create' && !slugEdited && (
            <p className="mt-0.5 text-xs text-muted-foreground">{t('slugHint')}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{t('labelStatus')}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PostPublicationStatus)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="published">{t('statusPublished')}</option>
            <option value="draft">{t('statusDraft')}</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">{t('labelField')}</label>
          <select
            required
            value={fieldId}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t('selectField')}</option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">{t('labelCategory')}</label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!fieldId || filteredCategories.length === 0}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="">{t('selectCategory')}</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          {fieldId && filteredCategories.length === 0 && (
            <p className="mt-1 text-xs text-muted-foreground">{t('noCategoriesInField')}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">{t('labelExcerpt')}</label>
          <textarea
            required
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">{t('labelContent')}</label>
          <textarea
            required
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">{t('labelThumbnail')}</label>
          <ThumbnailUploader value={thumbnailUrl} onChange={setThumbnailUrl} postSlug={slug} />
        </div>
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-medium">{t('tagsHeading')}</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label
                key={tag.id}
                className="inline-flex items-center gap-1.5 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={tagIds.includes(tag.id)}
                  onChange={() => toggleTag(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('labelSeoTitle')}</label>
          <input
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('labelSeoDescription')}</label>
          <input
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">{t('seoKeywords')}</label>
          <input
            value={seoKeywords}
            onChange={(e) => setSeoKeywords(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading || slugStatus === 'taken' || slugStatus === 'checking'}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 cursor-pointer"
        >
          {loading ? t('saving') : t('save')}
        </button>
        {mode === 'edit' && (
          <button
            type="button"
            disabled={loading}
            onClick={onDelete}
            className="rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive disabled:opacity-60 cursor-pointer"
          >
            {t('deletePost')}
          </button>
        )}
      </div>
    </form>
  );
}

// ── ThumbnailUploader ─────────────────────────────────────────────────────────

interface ThumbnailUploaderProps {
  value: string;
  onChange: (url: string) => void;
  postSlug: string;
}

function ThumbnailUploader({ value, onChange, postSlug }: ThumbnailUploaderProps) {
  const t = useTranslations('admin.cms.postEditor');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const slug = postSlug.trim() || `post-${Date.now()}`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'thumbnails');
      formData.append('path', `${slug}/thumbnail.${ext}`);

      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? t('uploadFailed'));
      onChange(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t('uploadFailed'));
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      {value && (
        <div className="relative w-full max-w-sm overflow-hidden rounded-lg border border-border bg-muted">
          <Image
            src={value}
            alt="Thumbnail preview"
            width={400}
            height={225}
            className="h-auto w-full object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors cursor-pointer"
            aria-label={t('removeImageAria')}
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
      )}

      {/* Upload + URL row */}
      <div className="flex gap-2">
        {/* Upload button */}
        <label
          className={`inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
        >
          {uploading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {t('uploadLoading')}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              {t('uploadCta')}
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>

        {/* URL input */}
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('urlPlaceholder')}
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
      <p className="text-xs text-muted-foreground">{t('uploadHint')}</p>
    </div>
  );
}
