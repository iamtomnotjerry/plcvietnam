'use client';

import { useCallback, useState } from 'react';
import {
  PostEditorForm,
  type PostEditorDraftSnapshot,
  type PostEditorInitial,
  type PostEditorCategoryOption,
  type PostEditorFieldOption,
  type PostEditorTagOption,
} from '@/features/cms/components/PostEditorForm';
import { PostDraftLivePreview } from '@/features/cms/components/PostDraftLivePreview';

export interface PostComposerSplitWorkspaceProps {
  mode: 'create' | 'edit';
  initial: PostEditorInitial;
  fields: PostEditorFieldOption[];
  categories: PostEditorCategoryOption[];
  tags: PostEditorTagOption[];
  onCreateSuccess?: () => void;
  onEditSuccess?: () => void;
}

export function PostComposerSplitWorkspace({
  mode,
  initial,
  fields,
  categories,
  tags,
  onCreateSuccess,
  onEditSuccess,
}: PostComposerSplitWorkspaceProps) {
  const [draft, setDraft] = useState<PostEditorDraftSnapshot>(() => ({
    title: initial.title,
    content: initial.content,
    excerpt: initial.excerpt,
    categoryId: initial.categoryId,
    tagIds: initial.tagIds,
    slug: initial.slug,
    thumbnailUrl: initial.thumbnailUrl,
  }));

  const onDraftChange = useCallback((d: PostEditorDraftSnapshot) => {
    setDraft(d);
  }, []);

  return (
    <div className="flex min-h-[min(70dvh,640px)] flex-1 flex-col gap-0 md:min-h-[calc(100dvh-14rem)] md:flex-row">
      <div className="min-h-0 w-full min-w-0 overflow-y-auto border-border md:w-1/2 md:max-w-[50%] md:border-r">
        <div className="p-4 md:p-5">
          <PostEditorForm
            mode={mode}
            initial={initial}
            fields={fields}
            categories={categories}
            tags={tags}
            layout="splitComposer"
            onDraftChange={onDraftChange}
            onCreateSuccess={onCreateSuccess}
            onEditSuccess={onEditSuccess}
          />
        </div>
      </div>
      <div className="min-h-[280px] w-full min-w-0 md:w-1/2 md:max-w-[50%]">
        <PostDraftLivePreview draft={draft} fields={fields} categories={categories} tags={tags} />
      </div>
    </div>
  );
}
