import { describe, it, expect } from 'vitest';
import { pickHomepageFields, HOMEPAGE_FIELDS_LIMIT } from '@/lib/data/pick-homepage-fields';
import type { Field } from '@/lib/types/domain';

function f(
  id: string,
  created: string,
  opts?: { featured?: boolean }
): Field & { firstCategorySlug?: string } {
  const d = new Date(created);
  return {
    id,
    slug: id,
    name: id,
    description: '',
    postCount: 0,
    featuredOnHome: opts?.featured === true,
    createdAt: d,
    updatedAt: d,
    firstCategorySlug: 'c',
  };
}

describe('pickHomepageFields', () => {
  it('returns at most HOMEPAGE_FIELDS_LIMIT items', () => {
    const list = Array.from({ length: 10 }, (_, i) =>
      f(`id-${i}`, `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`)
    );
    expect(pickHomepageFields(list).length).toBe(HOMEPAGE_FIELDS_LIMIT);
  });

  it('with no featured flags, picks newest by createdAt', () => {
    const list = [
      f('old', '2020-01-01T00:00:00Z'),
      f('mid', '2021-06-01T00:00:00Z'),
      f('new', '2025-01-01T00:00:00Z'),
    ];
    const picked = pickHomepageFields(list, 2);
    expect(picked.map((x) => x.id)).toEqual(['new', 'mid']);
  });

  it('places featured first, then backfills with newest non-featured', () => {
    const list = [
      f('a', '2020-01-01T00:00:00Z', { featured: true }),
      f('b', '2025-01-01T00:00:00Z'),
      f('c', '2024-01-01T00:00:00Z', { featured: true }),
    ];
    const picked = pickHomepageFields(list, 3);
    expect(picked.map((x) => x.id)).toEqual(['c', 'a', 'b']);
  });
});
