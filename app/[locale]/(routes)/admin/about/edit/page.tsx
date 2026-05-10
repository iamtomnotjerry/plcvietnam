import { IdCard } from 'lucide-react';
import { contentRepository } from '@/lib/data/factory';
import { AuthorEditorForm } from '@/features/cms/components/AuthorEditorForm';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AdminCmsPageHero } from '@/features/admin/components/AdminCmsPageHero';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export default async function AdminEditAboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'admin' });
  const author = await contentRepository.getAuthor();

  return (
    <div className="space-y-8">
      <AdminCmsPageHero
        title={t('aboutEdit.title')}
        subtitle={t('aboutEdit.subtitle')}
        icon={<IdCard className="h-6 w-6" aria-hidden />}
      />
      <AuthorEditorForm author={author} />
    </div>
  );
}
