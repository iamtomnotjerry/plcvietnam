/**
 * URL Generation Utility
 * Generates canonical URLs for blog content following defined patterns
 * Requirements: 10.1, 10.2
 */

/**
 * Generate post URL following pattern: /fields/{field-slug}/{category-slug}/{post-slug}
 * All slugs are URL-encoded to handle special characters safely.
 */
export function generatePostUrl(
  fieldSlug: string,
  categorySlug: string,
  postSlug: string
): string {
  return `/fields/${encodeURIComponent(fieldSlug)}/${encodeURIComponent(categorySlug)}/${encodeURIComponent(postSlug)}`;
}
