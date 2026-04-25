/**
 * Date Utilities
 * Reusable date formatting functions
 */

/**
 * Format date to Vietnamese locale
 * Returns fallback text if date is invalid
 */
export function formatDate(date: Date, locale = 'vi-VN'): string {
  // Validate date
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.error('formatDate: invalid date', date);
    return 'Ngày không hợp lệ';
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format date to short format (DD/MM/YYYY)
 * Returns fallback text if date is invalid
 */
export function formatDateShort(date: Date, locale = 'vi-VN'): string {
  // Validate date
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.error('formatDateShort: invalid date', date);
    return '--/--/----';
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Format relative time (e.g., "2 hours ago")
 * Returns fallback text if date is invalid
 */
export function formatRelativeTime(date: Date, locale = 'vi-VN'): string {
  // Validate date
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.error('formatRelativeTime: invalid date', date);
    return 'Thời gian không hợp lệ';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, 'minute');
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, 'hour');
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return rtf.format(-diffInDays, 'day');
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return rtf.format(-diffInMonths, 'month');
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(-diffInYears, 'year');
}

/**
 * Check if date is valid
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}
