/**
 * Client-side search engine for filtering posts and books
 * Validates Requirements: 9.2, 9.3, 9.5, 9.6
 */

import type { Post, Book } from '@/lib/types/domain';
import type { SearchResults } from '@/lib/data/repository';

/**
 * Search content across posts and books
 * 
 * @param query - Search query string
 * @param posts - Array of all posts to search
 * @param books - Array of all books to search
 * @returns SearchResults with matched posts, books, and total count
 * 
 * **Validates: Requirements 9.2, 9.3, 9.5, 9.6**
 * 
 * Search behavior:
 * - Returns empty results for queries < 2 characters (Req 9.2)
 * - Searches posts by: title, excerpt, category name, tag names (Req 9.3)
 * - Searches books by: title, description (Req 9.3)
 * - All searches are case-insensitive (Req 9.3)
 * - Returns SearchResults with posts, books, totalResults (Req 9.5, 9.6)
 */
export function searchContent(
  query: string,
  posts: Post[],
  books: Book[]
): SearchResults {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Return empty results for queries < 2 characters (Req 9.2)
  if (normalizedQuery.length < 2) {
    return { posts: [], books: [], totalResults: 0 };
  }
  
  // Search posts by title, excerpt, category name, tag names (Req 9.3)
  const matchedPosts = posts.filter(post => {
    const titleMatch = post.title.toLowerCase().includes(normalizedQuery);
    const excerptMatch = post.excerpt.toLowerCase().includes(normalizedQuery);
    const categoryMatch = post.category?.name.toLowerCase().includes(normalizedQuery);
    const tagMatch = post.tags.some(tag => 
      tag.name.toLowerCase().includes(normalizedQuery)
    );
    
    return titleMatch || excerptMatch || categoryMatch || tagMatch;
  });
  
  // Search books by title and description (Req 9.3)
  const matchedBooks = books.filter(book => {
    const titleMatch = book.title.toLowerCase().includes(normalizedQuery);
    const descMatch = book.description.toLowerCase().includes(normalizedQuery);
    
    return titleMatch || descMatch;
  });
  
  // Return SearchResults with totalResults count (Req 9.5, 9.6)
  return {
    posts: matchedPosts,
    books: matchedBooks,
    totalResults: matchedPosts.length + matchedBooks.length
  };
}
