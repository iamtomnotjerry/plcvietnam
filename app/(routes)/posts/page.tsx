import Link from 'next/link';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { contentRepository } from '@/lib/data/factory';
import { PostsPageClient } from '@/features/posts/components/PostsPageClient';

export const dynamic = 'force-dynamic';

interface PostsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Tất cả bài viết | Automation Blog',
    description: 'Danh sách bài viết về PLC, SCADA, Siemens và tự động hóa công nghiệp',
  };
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const sp = await searchParams;
  const pageParam = parseInt(sp.page || '1', 10);
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const limit = 12;

  const postsResult = await contentRepository.getPosts({
    page,
    limit,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  return (
    <main className="min-h-screen">
      <div className="border-b border-border bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">Bài viết</li>
            </ol>
          </nav>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-3">
            Tất cả bài viết
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Khám phá toàn bộ nội dung về tự động hóa, PLC, SCADA và hệ thống công nghiệp.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <Suspense
          fallback={
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          }
        >
          <PostsPageClient
            posts={postsResult.data}
            pagination={{
              page: postsResult.pagination.page,
              totalPages: postsResult.pagination.totalPages,
            }}
          />
        </Suspense>
      </div>
    </main>
  );
}
