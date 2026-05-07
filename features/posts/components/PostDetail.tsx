/**
 * PostDetail Component
 * Main container for post detail page with all metadata and features
 * Validates Requirements: 3.1, 3.4, 3.5, 3.6, 12.1, 13.4, 14.1, 14.2, 14.3, 14.4, 14.5
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { Post } from '@/lib/types/domain';
import { PostContent } from './PostContent';
import { TableOfContents } from './TableOfContents';
import { RelatedPosts } from './RelatedPosts';
import { SocialShare } from './SocialShare';
import Link from 'next/link';
import Image from 'next/image';
import { categoryHref, fieldHref, tagHref } from '@/lib/utils/routes';
import { PostComments } from '@/features/comments/components/PostComments';
import { useAdminRole } from '@/features/auth/hooks/useAdminRole';

export interface PostDetailProps {
  /**
   * Post to display
   */
  post: Post;

  /**
   * Related posts to show at bottom
   */
  relatedPosts: Post[];

  /**
   * Optional class name for styling
   */
  className?: string;
}

/**
 * PostDetail Component
 *
 * Main post detail container displaying:
 * - Breadcrumb navigation (Field → Category → Post)
 * - Post title, author, date, reading time, view count
 * - Post content with images and videos
 * - Table of contents (if 3+ headings)
 * - Tags
 * - Social sharing buttons
 * - Related posts
 *
 * Layout:
 * - Two-column layout on desktop (content + TOC sidebar)
 * - Single column on mobile
 *
 * Requirements:
 * - 3.1: Display full post content with metadata
 * - 3.4: Display table of contents for posts with 3+ headings
 * - 3.5: Display previous/next post navigation (not implemented in this component)
 * - 3.6: Display breadcrumb path
 * - 12.1: Display tags at bottom of post
 * - 13.4: Increment view count on page load
 * - 14.1-14.5: Social sharing buttons
 */
export function PostDetail({ post, relatedPosts, className = '' }: PostDetailProps) {
  const { isEditor } = useAdminRole();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Check if user can edit/delete (admin or author)
  const canEdit = isEditor;

  /**
   * Handle delete post
   */
  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

    setDeleteError(null);
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message =
          typeof data?.error?.message === 'string'
            ? data.error.message
            : 'Xóa bài viết thất bại. Vui lòng thử lại.';
        setDeleteError(message);
        return;
      }

      // Trigger navigation refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('navigation:refresh'));
      }

      // Redirect to posts list
      router.push('/admin/posts' as Route);
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      setDeleteError('Xóa bài viết thất bại. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Increment view count on component mount
   * Requirement 13.4: Increment view count on post page load
   */
  useEffect(() => {
    // Only increment once per session by keeping track in sessionStorage
    const sessionKey = `viewed-${post.id}`;
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, 'true');

      // Update actual database view count
      fetch(`/api/posts/${post.id}/view`, { method: 'POST' }).catch((err) =>
        console.error('Failed to increment view', err)
      );

      // Also keep local storage tracker for mock environments
      const key = `post-views-${post.id}`;
      const current = parseInt(localStorage.getItem(key) || '0', 10);
      localStorage.setItem(key, (current + 1).toString());
    }
  }, [post.id]);

  /**
   * Format date to Vietnamese locale
   */
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  /**
   * Get full URL for social sharing
   */
  const getPostUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  };

  return (
    <article className={`${className}`}>
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href={'/' as Route} className="hover:text-primary transition-colors duration-200">
              Trang chủ
            </Link>
          </li>
          <li>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li>
            <Link
              href={
                (post.category?.field?.slug ? fieldHref(post.category.field.slug) : '/') as Route
              }
              className="hover:text-primary transition-colors duration-200"
            >
              {post.category?.field?.name}
            </Link>
          </li>
          <li>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li>
            <Link
              href={
                (post.category?.field?.slug && post.category?.slug
                  ? categoryHref(post.category.field.slug, post.category.slug)
                  : '/') as Route
              }
              className="hover:text-primary transition-colors duration-200"
            >
              {post.category?.name}
            </Link>
          </li>
          <li>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li className="text-foreground font-medium truncate">{post.title}</li>
        </ol>
      </nav>

      {/* Post header */}
      <header className="mb-8">
        {deleteError && (
          <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {deleteError}
          </p>
        )}
        {/* Title and Action Buttons */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-4xl font-bold text-card-foreground flex-1">{post.title}</h1>

          {/* Edit and Delete buttons (admin/author only) */}
          {canEdit && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/admin/posts/${post.id}/edit` as Route}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Sửa
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
          {/* Author */}
          {post.author && (
            <div className="flex items-center gap-2">
              {post.author.avatarUrl && (
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              )}
              <span className="font-medium text-foreground">{post.author.name}</span>
            </div>
          )}

          {/* Publication date */}
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatDate(post.publishedAt)}</span>
          </div>

          {/* Reading time */}
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{post.readingTimeMinutes} phút đọc</span>
          </div>

          {/* View count */}
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
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
            <span>{post.viewCount.toLocaleString('vi-VN')} lượt xem</span>
          </div>
        </div>

        {/* Social share */}
        <SocialShare url={getPostUrl()} title={post.title} />
      </header>

      {/* Two-column layout: Content + TOC */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        {/* Main content */}
        <div className="min-w-0">
          {/* Post content */}
          <PostContent content={post.content} />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Thẻ:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={tagHref(tag.slug) as Route}
                    className="
                      inline-flex items-center
                      px-3 py-1.5
                      rounded-full
                      text-sm font-medium
                      bg-muted hover:bg-muted/80
                      text-muted-foreground hover:text-foreground
                      transition-colors duration-200
                      cursor-pointer
                    "
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table of contents sidebar (desktop only) */}
        <aside className="hidden lg:block">
          <TableOfContents content={post.content} />
        </aside>
      </div>

      <div className="mt-12 pt-12 border-t border-border">
        <PostComments postId={post.id} postSlug={post.slug} />
      </div>

      {/* Related posts */}
      <RelatedPosts posts={relatedPosts} className="mt-12 pt-12 border-t border-border" />
    </article>
  );
}
