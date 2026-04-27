import { notFound } from 'next/navigation';
import { contentRepository } from '@/lib/data/factory';
import { loadPostEditorOptions } from '@/features/cms/utils/loadEditorOptions';
import { PostEditorForm } from '@/features/cms/components/PostEditorForm';

export const dynamic = 'force-dynamic';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const [post, { fields, categories, tags }] = await Promise.all([
    contentRepository.getPostById(id),
    loadPostEditorOptions(),
  ]);

  if (!post) notFound();

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl font-semibold tracking-tight">Sửa bài</h1>
      <p className="mb-8 text-sm text-muted-foreground">{post.title}</p>
      <PostEditorForm
        mode="edit"
        fields={fields}
        categories={categories}
        tags={tags}
        initial={{
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          categoryId: post.categoryId,
          tagIds: post.tags.map((t) => t.id),
          thumbnailUrl: post.thumbnailUrl ?? '',
          status: post.status ?? 'published',
          seo: post.seo,
        }}
      />
    </div>
  );
}
