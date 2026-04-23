/**
 * Related Posts Hook and Algorithm
 * Validates Requirements 12.4, 12.5
 * 
 * Finds posts related to the current post based on shared tags and category.
 * Scoring algorithm:
 * - Each shared tag: +2 points
 * - Same category: +1 point
 * - Fallback: Recent posts from same category if no shared tags
 */

import { Post } from '@/lib/types/domain';

function publishedTimeMs(post: Post): number {
  const t = post.publishedAt.getTime();
  return Number.isFinite(t) ? t : Number.NEGATIVE_INFINITY;
}

/**
 * Find related posts based on shared tags or same category
 * 
 * @param currentPost - The current post to find related posts for
 * @param allPosts - All available posts to search through
 * @param limit - Maximum number of related posts to return
 * @returns Array of related posts, sorted by relevance score and date
 * 
 * @example
 * ```typescript
 * const related = findRelatedPosts(currentPost, allPosts, 4);
 * // Returns up to 4 posts with shared tags or from same category
 * ```
 */
export function findRelatedPosts(
  currentPost: Post,
  allPosts: Post[],
  limit: number
): Post[] {
  const currentTagIds = new Set(currentPost.tags.map(t => t.id));
  
  // Score each post by number of shared tags
  const scored = allPosts
    .filter(post => post.id !== currentPost.id)
    .map(post => {
      const sharedTags = post.tags.filter(tag => currentTagIds.has(tag.id)).length;
      const isSameCategory = post.categoryId === currentPost.categoryId;
      
      return {
        post,
        score: sharedTags * 2 + (isSameCategory ? 1 : 0)
      };
    })
    .filter(item => item.score > 0);
  
  // Sort by score descending, then by date descending
  scored.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    return publishedTimeMs(b.post) - publishedTimeMs(a.post);
  });
  
  // If no posts with shared tags, return recent posts from same category
  if (scored.length === 0) {
    return allPosts
      .filter(post => 
        post.id !== currentPost.id && 
        post.categoryId === currentPost.categoryId
      )
      .sort((a, b) => publishedTimeMs(b) - publishedTimeMs(a))
      .slice(0, limit);
  }
  
  return scored.slice(0, limit).map(item => item.post);
}
