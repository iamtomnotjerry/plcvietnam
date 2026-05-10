'use client';

import { PenSquare } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import type { Route } from 'next';
import { useTranslations } from 'next-intl';
import { ADMIN_CMS_HERO_CTA_CLASS } from '@/features/admin/admin-table-styles';
import { PostComposerModalFrame } from '@/features/cms/components/PostComposerModalFrame';
import { PostComposerSplitWorkspace } from '@/features/cms/components/PostComposerSplitWorkspace';
import type {
  PostEditorCategoryOption,
  PostEditorFieldOption,
  PostEditorTagOption,
} from '@/features/cms/components/PostEditorForm';

export interface AdminNewPostComposerLauncherProps {
  fields: PostEditorFieldOption[];
  categories: PostEditorCategoryOption[];
  tags: PostEditorTagOption[];
  ctaLabel: string;
  firstCategoryId: string;
}

export function AdminNewPostComposerLauncher({
  fields,
  categories,
  tags,
  ctaLabel,
  firstCategoryId,
}: AdminNewPostComposerLauncherProps) {
  const t = useTranslations('admin.cms.postEditor');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  const queryHandled = useRef(false);

  useEffect(() => {
    if (searchParams.get('compose') === '1') {
      if (!queryHandled.current) {
        queryHandled.current = true;
        setSession((s) => s + 1);
        setOpen(true);
        router.replace('/admin/posts' as Route);
      }
    } else {
      queryHandled.current = false;
    }
  }, [searchParams, router]);

  const openModal = () => {
    setSession((s) => s + 1);
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  const initial = {
    slug: '',
    title: '',
    excerpt: '',
    content: '<p></p>',
    categoryId: firstCategoryId,
    tagIds: [] as string[],
    thumbnailUrl: '',
    status: 'draft' as const,
    seo: { title: '', description: '', keywords: [] as string[] },
  };

  return (
    <>
      <button type="button" className={ADMIN_CMS_HERO_CTA_CLASS} onClick={openModal}>
        <PenSquare className="h-4 w-4" aria-hidden />
        {ctaLabel}
      </button>

      {open ? (
        <PostComposerModalFrame
          title={t('composerTitle')}
          closeLabel={t('composerClose')}
          onClose={closeModal}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-muted/10">
            <PostComposerSplitWorkspace
              key={session}
              mode="create"
              initial={initial}
              fields={fields}
              categories={categories}
              tags={tags}
              onCreateSuccess={closeModal}
            />
          </div>
        </PostComposerModalFrame>
      ) : null}
    </>
  );
}
