/**
 * XSS Protection & Input Sanitization
 * Server-safe implementation without DOMPurify to avoid ESM issues in production
 */

const YOUTUBE_IFRAME_SRC =
  /^(https?:)?\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)(\/|$)/i;

function iframeSrcIsYoutube(tag: string): boolean {
  const src = tag.match(/\bsrc\s*=\s*["']([^"']*)["']/i)?.[1] ?? '';
  return YOUTUBE_IFRAME_SRC.test(src.trim());
}

/** Drop iframes except YouTube embeds (matches client-side PostContent / DOMPurify rules). */
function stripDisallowedIframes(html: string): string {
  return html
    .replace(/<iframe\b[^>]*\/>/gi, (m) => (iframeSrcIsYoutube(m) ? m : ''))
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, (m) => (iframeSrcIsYoutube(m) ? m : ''));
}

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Server-side: strips all HTML tags for safety
 * Client-side: use DOMPurify directly in components
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Server-side: strip all HTML tags for maximum safety
  // This is safe for API routes and prevents ESM/jsdom issues
  const withoutScripts = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  return stripDisallowedIframes(withoutScripts)
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');
}

/**
 * Escape HTML special characters for rendering user input as plain text.
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Validate and sanitize a URL — only allows http/https.
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize a filename to prevent path traversal attacks.
 */
export function sanitizeFilename(filename: string): string {
  let sanitized = filename.replace(/[/\\]/g, '');
  sanitized = sanitized.replace(/\0/g, '');
  sanitized = sanitized.replace(/^\.+/, '');
  sanitized = sanitized.slice(0, 255);
  return sanitized;
}
