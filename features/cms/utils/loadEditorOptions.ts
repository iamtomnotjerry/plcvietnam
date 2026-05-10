import { contentRepository } from '@/lib/data/factory';
import type {
  PostEditorCategoryOption,
  PostEditorTagOption,
  PostEditorFieldOption,
} from '@/features/cms/components/PostEditorForm';

export async function loadPostEditorOptions(): Promise<{
  fields: PostEditorFieldOption[];
  categories: PostEditorCategoryOption[];
  tags: PostEditorTagOption[];
}> {
  const [fields, tagList] = await Promise.all([
    contentRepository.getFields(),
    contentRepository.getTags(),
  ]);

  const fieldOptions: PostEditorFieldOption[] = [];
  const categories: PostEditorCategoryOption[] = [];

  for (const f of fields) {
    fieldOptions.push({ id: f.id, name: f.name, slug: f.slug });
    const cats = await contentRepository.getCategoriesByFieldId(f.id);
    for (const c of cats) {
      categories.push({ id: c.id, label: c.name, fieldId: f.id, slug: c.slug });
    }
  }

  const tags: PostEditorTagOption[] = tagList.map((t) => ({ id: t.id, name: t.name }));
  return { fields: fieldOptions, categories, tags };
}
