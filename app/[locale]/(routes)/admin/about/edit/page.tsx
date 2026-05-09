import { contentRepository } from '@/lib/data/factory';
import { AuthorEditorForm } from '@/features/cms/components/AuthorEditorForm';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export default async function AdminEditAboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'admin' });
  const author = await contentRepository.getAuthor();

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl font-semibold tracking-tight">
        {t('aboutEdit.title')}
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">{t('aboutEdit.subtitle')}</p>
      <AuthorEditorForm author={author} />
    </div>
  );
}
