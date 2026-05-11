'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Route } from 'next';
import type { Post, PostPublicationStatus, SEOMetadata } from '@/lib/types/domain';
import { adminFetchFormDataJson, adminFetchJson } from '@/lib/admin/admin-fetch';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { RichTextEditor } from '@/features/cms/components/RichTextEditor';
import { triggerNavigationRefresh } from '@/lib/events/navigation';

export interface PostEditorCategoryOption {
  id: string;
  label: string;
  fieldId: string;
  slug: string;
}

export interface PostEditorTagOption {
  id: string;
  name: string;
}

export interface PostEditorFieldOption {
  id: string;
  name: string;
  slug: string;
}

/** Live preview / parent sync — updated on each relevant field change */
export interface PostEditorDraftSnapshot {
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  tagIds: string[];
  slug: string;
  thumbnailUrl: string;
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
  /** Single-column layout for narrow composer panel (split with preview). */
  layout?: 'default' | 'splitComposer';
  /** Fires when draft fields used by live preview change. */
  onDraftChange?: (draft: PostEditorDraftSnapshot) => void;
  /** After successful create (before navigate to list). */
  onCreateSuccess?: () => void;
  /** After successful edit when embedded (e.g. modal): skip default redirects. */
  onEditSuccess?: () => void;
}

// Convert Vietnamese title → URL-safe slug
/** True when TipTap/HTML body has no visible text (allows <p></p>, whitespace, br). */
function isPostBodyEmpty(html: string): boolean {
  if (typeof document === 'undefined') {
    return html.replace(/<[^>]*>/g, '').replace(/\s|&nbsp;/g, '').length === 0;
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '').replace(/\u00a0/g, ' ').trim().length === 0;
}

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

export function PostEditorForm({
  mode,
  initial,
  fields,
  categories,
  tags,
  layout = 'default',
  onDraftChange,
  onCreateSuccess,
  onEditSuccess,
}: PostEditorFormProps) {
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
  const [editorPanel, setEditorPanel] = useState<'content' | 'seo'>('content');

  const onDraftChangeRef = useRef(onDraftChange);
  useEffect(() => {
    onDraftChangeRef.current = onDraftChange;
  }, [onDraftChange]);

  useEffect(() => {
    onDraftChangeRef.current?.({
      title,
      content,
      excerpt,
      categoryId,
      tagIds,
      slug,
      thumbnailUrl,
    });
  }, [title, content, excerpt, categoryId, tagIds, slug, thumbnailUrl]);

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
          const data = await adminFetchJson<{ available: boolean }>(
            `/api/admin/posts/check-slug?${params}`
          );
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
    if (isPostBodyEmpty(content)) {
      setError(t('errorContentRequired'));
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
      const data = await adminFetchJson<Post>(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // Sidebar + admin lists that listen for this event
      triggerNavigationRefresh();

      // Redirect logic:
      // - Create mode: Always go to posts list to see the new post
      // - Edit mode + Draft: Stay on edit page to continue editing
      // - Edit mode + Published: Can go to public page
      if (mode === 'create') {
        onCreateSuccess?.();
        router.push('/admin/posts' as Route);
      } else if (onEditSuccess) {
        onEditSuccess();
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
      // Defer so refresh runs after client navigation has been applied (push + refresh same tick can leave the table stale).
      queueMicrotask(() => {
        router.refresh();
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('saveFailed'));
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
      await adminFetchJson(`/api/admin/posts/${initial.id}`, { method: 'DELETE' });
      router.push('/admin/posts' as Route);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('deleteFailed'));
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

  const slugInputClass =
    slugStatus === 'taken'
      ? 'border-destructive font-mono'
      : slugStatus === 'available'
        ? 'border-emerald-500 font-mono'
        : 'font-mono';

  const isSplit = layout === 'splitComposer';

  return (
    <form
      onSubmit={onSubmit}
      className={`mx-auto space-y-6 pb-4 ${isSplit ? 'max-w-none' : 'max-w-6xl'}`}
    >
      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div
        className={
          isSplit ? 'grid grid-cols-1 gap-6' : 'grid gap-6 lg:grid-cols-12 lg:gap-8 lg:items-start'
        }
      >
        <div className={`space-y-6 ${isSplit ? '' : 'lg:col-span-5'}`}>
          <Card variant="elevated" className="overflow-hidden">
            <div className="space-y-4 border-b border-border/80 bg-muted/20 px-5 py-4 sm:px-6">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                {t('sectionMeta')}
              </h2>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('labelTitle')}</label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">{tCrud('labelSlug')}</label>
                <Input
                  required
                  value={slug}
                  onChange={handleSlugChange}
                  className={`w-full ${slugInputClass}`}
                />
                <div className="mt-1 h-4">{slugIndicator()}</div>
                {mode === 'create' && !slugEdited && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{t('slugHint')}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('labelStatus')}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PostPublicationStatus)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="published">{t('statusPublished')}</option>
                  <option value="draft">{t('statusDraft')}</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('labelField')}</label>
                <select
                  required
                  value={fieldId}
                  onChange={(e) => handleFieldChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">{t('selectField')}</option>
                  {fields.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('labelCategory')}</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={!fieldId || filteredCategories.length === 0}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
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

              <div>
                <label className="mb-1.5 block text-sm font-medium">{t('labelThumbnail')}</label>
                <ThumbnailUploader
                  value={thumbnailUrl}
                  onChange={setThumbnailUrl}
                  postSlug={slug}
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">{t('tagsHeading')}</p>
                <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-md border border-border/60 bg-muted/10 p-3">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm hover:bg-muted/60"
                    >
                      <input
                        type="checkbox"
                        checked={tagIds.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                        className="rounded border-input"
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className={`space-y-6 ${isSplit ? '' : 'lg:col-span-7'}`}>
          <Card variant="elevated" className="overflow-hidden">
            <div className="flex gap-1 border-b border-border bg-muted/25 p-1.5 sm:px-2">
              <button
                type="button"
                onClick={() => setEditorPanel('content')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  editorPanel === 'content'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('tabContent')}
              </button>
              <button
                type="button"
                onClick={() => setEditorPanel('seo')}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  editorPanel === 'seo'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t('tabSeo')}
              </button>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              {editorPanel === 'content' ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{t('labelExcerpt')}</label>
                    <Textarea
                      required
                      rows={4}
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{t('labelContent')}</label>
                    <RichTextEditor
                      key={mode === 'edit' && initial.id ? initial.id : 'new-post'}
                      value={content}
                      onChange={setContent}
                      ariaLabel={t('labelContent')}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{t('labelSeoTitle')}</label>
                    <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      {t('labelSeoDescription')}
                    </label>
                    <Input
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">{t('seoKeywords')}</label>
                    <Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} />
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-2 border-t border-border bg-background/95 px-4 py-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/85 md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={loading || slugStatus === 'taken' || slugStatus === 'checking'}
            isLoading={loading}
          >
            {loading ? t('saving') : t('save')}
          </Button>
          {mode === 'edit' && (
            <Button type="button" variant="destructive" disabled={loading} onClick={onDelete}>
              {t('deletePost')}
            </Button>
          )}
        </div>
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

      const data = await adminFetchFormDataJson<{ url: string }>('/api/admin/upload', formData);
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
