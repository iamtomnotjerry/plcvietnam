/**
 * Live preview of a draft post — mirrors public post layout (read view) without comments/related.
 */

'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { Route } from 'next';
import type { Post } from '@/lib/types/domain';
import { PostContent } from '@/features/posts/components/PostContent';
import { TableOfContents } from '@/features/posts/components/TableOfContents';
import { SocialShare } from '@/features/posts/components/SocialShare';
import { Link } from '@/i18n/navigation';
import { categoryHref, fieldHref } from '@/lib/utils/routes';
import { calculateReadingTime } from '@/features/posts/utils/readingTime';
import type {
  PostEditorCategoryOption,
  PostEditorDraftSnapshot,
  PostEditorFieldOption,
  PostEditorTagOption,
} from '@/features/cms/components/PostEditorForm';

const PREVIEW_SCOPE = 'post-draft-preview-scope';
const PREVIEW_SCROLL = 'post-draft-preview-scroll';

export interface PostDraftLivePreviewProps {
  draft: PostEditorDraftSnapshot;
  fields: PostEditorFieldOption[];
  categories: PostEditorCategoryOption[];
  tags: PostEditorTagOption[];
}

function buildPreviewPost(
  draft: PostEditorDraftSnapshot,
  fields: PostEditorFieldOption[],
  categories: PostEditorCategoryOption[],
  tags: PostEditorTagOption[]
): Post {
  const categoryOpt = categories.find((c) => c.id === draft.categoryId);
  const fieldOpt = categoryOpt ? fields.find((f) => f.id === categoryOpt.fieldId) : undefined;

  const tagObjs = draft.tagIds
    .map((id) => tags.find((x) => x.id === id))
    .filter((x): x is PostEditorTagOption => Boolean(x))
    .map((t) => ({
      id: t.id,
      slug: t.name.toLowerCase().replace(/\s+/g, '-'),
      name: t.name,
      postCount: 0,
    }));

  const field = fieldOpt
    ? {
        id: fieldOpt.id,
        slug: fieldOpt.slug,
        name: fieldOpt.name,
        description: '',
        postCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    : undefined;

  const category = categoryOpt
    ? {
        id: categoryOpt.id,
        slug: categoryOpt.slug,
        name: categoryOpt.label,
        description: '',
        fieldId: categoryOpt.fieldId,
        field,
        postCount: 0,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    : undefined;

  const slug = draft.slug.trim() || 'bai-xem-truoc';

  return {
    id: 'draft-preview',
    slug,
    title: draft.title.trim() || '…',
    excerpt: draft.excerpt,
    content: draft.content,
    thumbnailUrl: draft.thumbnailUrl.trim() || undefined,
    categoryId: draft.categoryId || 'preview',
    category,
    authorId: '',
    tags: tagObjs,
    publishedAt: new Date(),
    updatedAt: new Date(),
    viewCount: 0,
    readingTimeMinutes: calculateReadingTime(draft.content),
    seo: { title: '', description: '', keywords: [] },
  };
}

export function PostDraftLivePreview({
  draft,
  fields,
  categories,
  tags,
}: PostDraftLivePreviewProps) {
  const locale = useLocale();
  const t = useTranslations('posts');
  const tNav = useTranslations('nav');
  const tAdmin = useTranslations('admin.cms.postEditor');
  const post = buildPreviewPost(draft, fields, categories, tags);
  const intlLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(intlLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);

  const previewPath =
    post.category?.field?.slug && post.category?.slug
      ? `/fields/${post.category.field.slug}/${post.category.slug}/${post.slug}`
      : '';

  const shareUrl =
    typeof window !== 'undefined' && previewPath
      ? `${window.location.origin}/${locale}${previewPath}`
      : typeof window !== 'undefined'
        ? window.location.href
        : '';

  return (
    <div
      id={PREVIEW_SCROLL}
      className="h-full min-h-0 overflow-y-auto overscroll-contain bg-muted/20 px-4 py-6 md:px-6"
    >
      <div className="mx-auto max-w-4xl pb-16">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {tAdmin('livePreviewBadge')}
        </p>
        <article
          id={PREVIEW_SCOPE}
          className="rounded-xl border border-border/80 bg-card/90 p-5 shadow-sm md:p-8"
        >
          <nav className="mb-6" aria-label={t('breadcrumbAria')}>
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href={'/' as Route}
                  className="hover:text-primary transition-colors duration-200"
                >
                  {tNav('home')}
                </Link>
              </li>
              <li aria-hidden>›</li>
              <li>
                {post.category?.field ? (
                  <Link
                    href={fieldHref(post.category.field.slug)}
                    className="hover:text-primary transition-colors duration-200"
                  >
                    {post.category.field.name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </li>
              <li aria-hidden>›</li>
              <li>
                {post.category?.field?.slug && post.category?.slug ? (
                  <Link
                    href={categoryHref(post.category.field.slug, post.category.slug) as Route}
                    className="hover:text-primary transition-colors duration-200"
                  >
                    {post.category.name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </li>
              <li aria-hidden>›</li>
              <li className="max-w-[12rem] truncate text-foreground font-medium">{post.title}</li>
            </ol>
          </nav>

          <header className="mb-8">
            <h1 className="mb-4 text-3xl font-bold text-card-foreground md:text-4xl">
              {post.title}
            </h1>
            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <time dateTime={post.publishedAt.toISOString()}>
                  {formatDate(post.publishedAt)}
                </time>
              </div>
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{t('readingMinutes', { count: post.readingTimeMinutes })}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <span>{t('viewsCount', { count: post.viewCount.toLocaleString(intlLocale) })}</span>
              </div>
            </div>
            <SocialShare url={shareUrl} title={post.title} />
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px]">
            <div className="min-w-0">
              <PostContent content={post.content} />
              {post.tags.length > 0 ? (
                <div className="mt-8 border-t border-border pt-8">
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                    {t('tagsHeading')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <aside className="hidden lg:block">
              <TableOfContents
                content={post.content}
                scopeSelector={`#${PREVIEW_SCOPE}`}
                scrollContainerSelector={`#${PREVIEW_SCROLL}`}
                className="top-6"
              />
            </aside>
          </div>
        </article>
      </div>
    </div>
  );
}
