import { notFound } from 'next/navigation';
import { contentRepository } from '@/lib/data/factory';
import { loadPostEditorOptions } from '@/features/cms/utils/loadEditorOptions';
import { PostEditorForm } from '@/features/cms/components/PostEditorForm';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

interface EditPostPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function AdminEditPostPage({ params }: EditPostPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'admin' });
  const [post, { fields, categories, tags }] = await Promise.all([
    contentRepository.getPostById(id),
    loadPostEditorOptions(),
  ]);

  if (!post) notFound();

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl font-semibold tracking-tight">
        {t('postEdit.title')}
      </h1>
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
          tagIds: post.tags.map((tag) => tag.id),
          thumbnailUrl: post.thumbnailUrl ?? '',
          status: post.status ?? 'published',
          seo: post.seo,
        }}
      />
    </div>
  );
}
