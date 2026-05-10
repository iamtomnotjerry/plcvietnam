import type { Field } from '@/lib/types/domain';

export const HOMEPAGE_FIELDS_LIMIT = 6;

/**
 * Homepage "Lĩnh vực": up to `limit` fields — featured first (newest by createdAt), then non-featured (newest).
 */
export function pickHomepageFields<T extends Field & { firstCategorySlug?: string }>(
  fields: T[],
  limit: number = HOMEPAGE_FIELDS_LIMIT
): T[] {
  const byNewest = (a: Field, b: Field) => b.createdAt.getTime() - a.createdAt.getTime();
  const featured = fields.filter((f) => f.featuredOnHome).sort(byNewest);
  const picked: T[] = [];
  const seen = new Set<string>();
  for (const f of featured) {
    if (picked.length >= limit) break;
    picked.push(f);
    seen.add(f.id);
  }
  if (picked.length < limit) {
    const rest = fields.filter((f) => !seen.has(f.id)).sort(byNewest);
    for (const f of rest) {
      if (picked.length >= limit) break;
      picked.push(f);
    }
  }
  return picked;
}
