import { describe, expect, it } from 'vitest';
import { buildAdminPostsListQuery } from './build-admin-posts-list-query';

describe('buildAdminPostsListQuery', () => {
  it('omits status when all', () => {
    const q = buildAdminPostsListQuery({ status: 'all', page: 2, limit: 10 });
    expect(q).toBe('page=2&limit=10');
  });

  it('includes status draft and search q', () => {
    const q = buildAdminPostsListQuery({
      status: 'draft',
      page: 1,
      limit: 50,
      q: '  plc  ',
    });
    expect(q).toContain('status=draft');
    expect(q).toContain('q=plc');
    expect(q).toContain('page=1');
    expect(q).toContain('limit=50');
  });
});
