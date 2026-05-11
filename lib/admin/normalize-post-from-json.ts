import type { Post } from '@/lib/types/domain';

/** JSON responses serialize `Date` as ISO strings — restore domain types for client tables. */
export function normalizePostFromJson(raw: unknown): Post {
  const p = raw as Post & { publishedAt: string | Date; updatedAt: string | Date };
  return {
    ...p,
    publishedAt: new Date(p.publishedAt as unknown as string),
    updatedAt: new Date(p.updatedAt as unknown as string),
  };
}
