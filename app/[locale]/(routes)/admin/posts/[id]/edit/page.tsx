import { notFound } from 'next/navigation';
import { PencilLine } from 'lucide-react';
import { contentRepository } from '@/lib/data/factory';
import { loadPostEditorOptions } from '@/features/cms/utils/loadEditorOptions';
import { PostEditorForm } from '@/features/cms/components/PostEditorForm';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AdminCmsPageHero } from '@/features/admin/components/AdminCmsPageHero';

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
    <div className="space-y-8">
      <AdminCmsPageHero
        title={t('postEdit.title')}
        subtitle={post.title}
        icon={<PencilLine className="h-6 w-6" aria-hidden />}
        detail={<p className="truncate font-mono text-xs text-muted-foreground">{post.slug}</p>}
      />
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
