import { loadPostEditorOptions } from '@/features/cms/utils/loadEditorOptions';
import { PostEditorForm } from '@/features/cms/components/PostEditorForm';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export default async function AdminNewPostPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'admin' });
  const { fields, categories, tags } = await loadPostEditorOptions();
  const firstCategoryId = categories[0]?.id ?? '';

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl font-semibold tracking-tight">
        {t('postNew.title')}
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">{t('postNew.subtitle')}</p>
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
