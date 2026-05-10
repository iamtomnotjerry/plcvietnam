/** Max visible characters before "…" + full-text tooltip (slug / id-like columns). */
export const ADMIN_TABLE_SLUG_MAX = 20;

/** Titles, names, tags in pills. */
export const ADMIN_TABLE_LABEL_MAX = 40;

/** Description / long text preview in table cells. */
export const ADMIN_TABLE_DESCRIPTION_MAX = 20;

/** Secondary single-line fields (e.g. series, author). */
export const ADMIN_TABLE_SECONDARY_MAX = 48;

export function truncateForTableDisplay(
  value: string,
  maxLength: number
): { text: string; truncated: boolean } {
  if (value.length <= maxLength) return { text: value, truncated: false };
  return { text: `${value.slice(0, maxLength)}...`, truncated: true };
}
