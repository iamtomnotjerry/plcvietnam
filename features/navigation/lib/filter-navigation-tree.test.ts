import { describe, it, expect } from 'vitest';
import { filterNavigationTreeByQuery } from './filter-navigation-tree';
import type { NavigationNode } from '@/lib/types/domain';

const sample: NavigationNode[] = [
  {
    id: 'f1',
    type: 'field',
    label: 'PLC',
    slug: 'plc',
    url: '/fields/plc',
    children: [
      {
        id: 'c1',
        type: 'category',
        label: 'Basics',
        slug: 'basics',
        url: '/fields/plc/basics',
        children: [
          {
            id: 'p1',
            type: 'post',
            label: 'Intro',
            slug: 'intro',
            url: '/fields/plc/basics/intro',
          },
        ],
      },
    ],
  },
  {
    id: 'f2',
    type: 'field',
    label: 'Other',
    slug: 'other',
    url: '/fields/other',
    children: [],
  },
];

describe('filterNavigationTreeByQuery', () => {
  it('returns full tree for empty query', () => {
    expect(filterNavigationTreeByQuery(sample, '')).toEqual(sample);
    expect(filterNavigationTreeByQuery(sample, '   ')).toEqual(sample);
  });

  it('filters by nested label', () => {
    const out = filterNavigationTreeByQuery(sample, 'intro');
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('f1');
    expect(out[0].children?.[0].children?.[0].label).toBe('Intro');
  });

  it('returns empty when no match', () => {
    expect(filterNavigationTreeByQuery(sample, 'zzz')).toEqual([]);
  });
});
