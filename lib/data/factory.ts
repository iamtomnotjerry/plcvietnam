/**
 * Data Provider Factory
 * Creates the appropriate data provider based on environment configuration
 * Requirements: 7.4, 7.5, 7.6, 7.8
 */

import type { ContentRepository } from './repository';
import { MockProvider } from './providers/mock';

/**
 * Creates a ContentRepository instance based on DATA_PROVIDER environment variable
 * 
 * @returns ContentRepository implementation (MockProvider or SupabaseProvider)
 * 
 * Environment Variables:
 * - DATA_PROVIDER: 'mock' | 'supabase' (defaults to 'mock')
 * 
 * Examples:
 * - DATA_PROVIDER=mock -> MockProvider
 * - DATA_PROVIDER=supabase -> SupabaseProvider
 * - (not set) -> MockProvider (default)
 */
export function createContentRepository(): ContentRepository {
  const provider = process.env.DATA_PROVIDER || 'mock';

  switch (provider) {
    case 'mock':
      return new MockProvider();
    case 'supabase':
      // Will be implemented in future tasks
      throw new Error('SupabaseProvider not yet implemented. Will be available in future tasks.');
    default:
      throw new Error(`Unknown data provider: ${provider}. Valid options: 'mock', 'supabase'`);
  }
}

/**
 * Lazy-initialized singleton instance of ContentRepository
 * Use this exported instance throughout the application for data access
 * 
 * Example usage:
 * ```typescript
 * import { contentRepository } from '@/lib/data/factory';
 * 
 * const posts = await contentRepository.getPosts({ page: 1, limit: 20 });
 * const author = await contentRepository.getAuthor();
 * ```
 */
let _instance: ContentRepository | null = null;

export const contentRepository = new Proxy({} as ContentRepository, {
  get(_target, prop) {
    if (!_instance) {
      _instance = createContentRepository();
    }
    return (_instance as any)[prop];
  },
});

/**
 * Get the singleton ContentRepository instance
 * Alternative to using the contentRepository proxy
 * 
 * @returns ContentRepository instance
 */
export function getRepository(): ContentRepository {
  if (!_instance) {
    _instance = createContentRepository();
  }
  return _instance;
}
