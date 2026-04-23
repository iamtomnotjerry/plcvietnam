/**
 * Tests for Content Repository interface and factory
 * Verifies type exports and factory behavior
 */

import { describe, it, expect } from 'vitest';
import type {
  ContentRepository,
  PostQueryOptions,
  BookQueryOptions,
  PaginatedResult,
  SearchResults,
  CreateCommentInput,
} from '../repository';
import { createContentRepository } from '../factory';

describe('ContentRepository Interface', () => {
  it('should export all required types', () => {
    // Type-only test - verifies TypeScript compilation
    const postOptions: PostQueryOptions = {
      page: 1,
      limit: 20,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    };

    const bookOptions: BookQueryOptions = {
      page: 1,
      limit: 12,
      series: 'PLC Programming',
    };

    const commentInput: CreateCommentInput = {
      postId: 'post-1',
      userId: 'user-1',
      userName: 'Test User',
      userAvatar: 'https://example.com/avatar.jpg',
      content: 'Great article!',
    };

    expect(postOptions).toBeDefined();
    expect(bookOptions).toBeDefined();
    expect(commentInput).toBeDefined();
  });

  it('should validate PaginatedResult structure', () => {
    const result: PaginatedResult<{ id: string }> = {
      data: [{ id: '1' }, { id: '2' }],
      pagination: {
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5,
      },
    };

    expect(result.data).toHaveLength(2);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.totalPages).toBe(5);
  });

  it('should validate SearchResults structure', () => {
    const results: SearchResults = {
      posts: [],
      books: [],
      totalResults: 0,
    };

    expect(results.posts).toEqual([]);
    expect(results.books).toEqual([]);
    expect(results.totalResults).toBe(0);
  });
});

describe('createContentRepository Factory', () => {
  it('should create MockProvider instance by default', () => {
    // Verify default behavior
    const originalEnv = process.env.DATA_PROVIDER;
    delete process.env.DATA_PROVIDER;

    const repository = createContentRepository();
    expect(repository).toBeDefined();
    expect(repository.getFields).toBeDefined();
    expect(repository.getPosts).toBeDefined();

    // Restore environment
    if (originalEnv) {
      process.env.DATA_PROVIDER = originalEnv;
    }
  });

  it('should create MockProvider when DATA_PROVIDER is "mock"', () => {
    const originalEnv = process.env.DATA_PROVIDER;
    process.env.DATA_PROVIDER = 'mock';

    const repository = createContentRepository();
    expect(repository).toBeDefined();
    expect(repository.getFields).toBeDefined();

    // Restore environment
    if (originalEnv) {
      process.env.DATA_PROVIDER = originalEnv;
    } else {
      delete process.env.DATA_PROVIDER;
    }
  });

  it('should throw error for unknown provider', () => {
    const originalEnv = process.env.DATA_PROVIDER;
    process.env.DATA_PROVIDER = 'unknown';

    expect(() => createContentRepository()).toThrow(
      "Unknown data provider: unknown. Valid options: 'mock', 'supabase'"
    );

    // Restore environment
    if (originalEnv) {
      process.env.DATA_PROVIDER = originalEnv;
    } else {
      delete process.env.DATA_PROVIDER;
    }
  });

  it('should throw error when SupabaseProvider is not yet implemented', () => {
    const originalEnv = process.env.DATA_PROVIDER;
    process.env.DATA_PROVIDER = 'supabase';

    expect(() => createContentRepository()).toThrow(
      'SupabaseProvider not yet implemented'
    );

    // Restore environment
    if (originalEnv) {
      process.env.DATA_PROVIDER = originalEnv;
    } else {
      delete process.env.DATA_PROVIDER;
    }
  });
});
