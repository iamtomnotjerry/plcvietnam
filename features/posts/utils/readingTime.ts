/**
 * Reading Time Calculation Utility
 * 
 * Calculates estimated reading time for post content based on word count.
 * Uses industry standard of 200 words per minute.
 * 
 * @module features/posts/utils/readingTime
 */

const WORDS_PER_MINUTE = 200;

/**
 * Calculate estimated reading time for content
 * 
 * Algorithm:
 * 1. Strip HTML tags from content
 * 2. Normalize whitespace (collapse multiple spaces/newlines to single space)
 * 3. Count words by splitting on whitespace
 * 4. Calculate minutes as ceil(wordCount / 200)
 * 5. Return minimum of 1 minute
 * 
 * @param content - The post content (may contain HTML tags)
 * @returns Reading time in minutes (minimum 1)
 * 
 * @example
 * ```typescript
 * calculateReadingTime('<p>Hello world</p>'); // Returns 1
 * calculateReadingTime('Lorem ipsum '.repeat(100)); // Returns 1
 * calculateReadingTime('word '.repeat(400)); // Returns 2
 * ```
 */
export function calculateReadingTime(content: string): number {
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  const normalized = plainText.replace(/\s+/g, ' ').trim();
  
  // Count words (split by whitespace)
  const wordCount = normalized.split(' ').filter(word => word.length > 0).length;
  
  // Calculate minutes, round up
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
  
  // Minimum 1 minute
  return Math.max(1, minutes);
}
