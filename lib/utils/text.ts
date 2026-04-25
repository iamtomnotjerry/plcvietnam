/**
 * Text Utilities
 * Reusable text manipulation functions
 */

/**
 * Truncate text to max length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Truncate text to max words
 */
export function truncateWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

/**
 * Strip HTML tags from text
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  const stripped = stripHtml(text);
  const words = stripped.split(/\s+/).filter((word) => word.length > 0);
  return words.length;
}

/**
 * Slugify text (convert to URL-friendly format)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Normalize Vietnamese characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd') // Replace đ
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
