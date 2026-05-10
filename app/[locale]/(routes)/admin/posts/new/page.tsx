import { FilePenLine } from 'lucide-react';
import { loadPostEditorOptions } from '@/features/cms/utils/loadEditorOptions';
import { PostEditorForm } from '@/features/cms/components/PostEditorForm';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AdminCmsPageHero } from '@/features/admin/components/AdminCmsPageHero';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export default async function AdminNewPostPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'admin' });
  const { fields, categories, tags } = await loadPostEditorOptions();
  const firstCategoryId = categories[0]?.id ?? '';

  return (
    <div className="space-y-8">
      <AdminCmsPageHero
        title={t('postNew.title')}
        subtitle={t('postNew.subtitle')}
        icon={<FilePenLine className="h-6 w-6" aria-hidden />}
      />
      <PostEditorForm
        mode="create"
        fields={fields}
        categories={categories}
        tags={tags}
        initial={{
          slug: '',
          title: '',
          excerpt: '',
          content: '<p></p>',
          categoryId: firstCategoryId,
          tagIds: [],
          thumbnailUrl: '',
          status: 'draft',
          seo: { title: '', description: '', keywords: [] },
        }}
      />
    </div>
  );
}
