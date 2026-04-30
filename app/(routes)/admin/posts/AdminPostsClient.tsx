'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import type { Post } from '@/lib/types/domain';

interface AdminPostsClientProps {
  posts: Post[];
}

export function AdminPostsClient({ posts }: AdminPostsClientProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (postId: string, postTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${postTitle}"?`)) return;

    setDeletingId(postId);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Xóa bài viết thất bại');
        return;
      }

      // Trigger navigation refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('navigation:refresh'));
      }

      // Refresh the page to show updated list
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Xóa bài viết thất bại');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className="px-4 py-3 font-medium">Tiêu đề</th>
            <th className="px-4 py-3 font-medium">Slug</th>
            <th className="px-4 py-3 font-medium">Trạng thái</th>
            <th className="px-4 py-3 font-medium">Cập nhật</th>
            <th className="px-4 py-3 font-medium text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                Không có bài viết.
              </td>
            </tr>
          ) : (
            posts.map((post) => (
              <tr key={post.id} className="border-b border-border/80 last:border-0">
                <td className="px-4 py-3 font-medium">{post.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{post.slug}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      (post.status ?? 'published') === 'draft'
                        ? 'rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                        : 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                    }
                  >
                    {(post.status ?? 'published') === 'draft' ? 'Nháp' : 'Xuất bản'}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {post.updatedAt.toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/posts/${post.id}/edit` as Route}
                      className="rounded-md px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={deletingId === post.id}
                      className="rounded-md px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === post.id ? 'Đang xóa...' : 'Xóa'}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
