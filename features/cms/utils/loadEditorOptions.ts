import { cache } from 'react';
import { contentRepository } from '@/lib/data/factory';
import type {
  PostEditorCategoryOption,
  PostEditorTagOption,
  PostEditorFieldOption,
} from '@/features/cms/components/PostEditorForm';

export type PostEditorOptionsResult = {
  fields: PostEditorFieldOption[];
  categories: PostEditorCategoryOption[];
  tags: PostEditorTagOption[];
};

async function loadPostEditorOptionsImpl(): Promise<PostEditorOptionsResult> {
  const [fields, tagList] = await Promise.all([
    contentRepository.getFields(),
    contentRepository.getTags(),
  ]);

  const categoriesByField = await Promise.all(
    fields.map((f) => contentRepository.getCategoriesByFieldId(f.id))
  );

  const fieldOptions: PostEditorFieldOption[] = fields.map((f) => ({
    id: f.id,
    name: f.name,
    slug: f.slug,
  }));

  const categories: PostEditorCategoryOption[] = [];
  fields.forEach((f, i) => {
    for (const c of categoriesByField[i]) {
      categories.push({ id: c.id, label: c.name, fieldId: f.id, slug: c.slug });
    }
  });

  const tags: PostEditorTagOption[] = tagList.map((t) => ({ id: t.id, name: t.name }));
  return { fields: fieldOptions, categories, tags };
}

/**
 * Cached per React server request — dedupes when list + edit (or layout + page) load in the same flight.
 * Category fetches run in parallel (previously one round-trip per field, which made filter tabs feel slow).
 */
export const loadPostEditorOptions = cache(loadPostEditorOptionsImpl);
