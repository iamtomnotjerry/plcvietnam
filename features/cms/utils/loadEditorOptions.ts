import { contentRepository } from '@/lib/data/factory';
import type { PostEditorCategoryOption, PostEditorTagOption } from '@/features/cms/components/PostEditorForm';

export async function loadPostEditorOptions(): Promise<{
  categories: PostEditorCategoryOption[];
  tags: PostEditorTagOption[];
}> {
  const [fields, tagList] = await Promise.all([
    contentRepository.getFields(),
    contentRepository.getTags(),
  ]);

  const categories: PostEditorCategoryOption[] = [];
  for (const f of fields) {
    const cats = await contentRepository.getCategoriesByFieldId(f.id);
    for (const c of cats) {
      categories.push({ id: c.id, label: `${f.name} — ${c.name}` });
    }
  }

  const tags: PostEditorTagOption[] = tagList.map(t => ({ id: t.id, name: t.name }));
  return { categories, tags };
}
