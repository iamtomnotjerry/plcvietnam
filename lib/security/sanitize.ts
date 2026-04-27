/**
 * XSS Protection & Input Sanitization
 * Prevents cross-site scripting attacks using DOMPurify
 */

import DOMPurify from 'isomorphic-dompurify';

// Enforce YouTube-only iframes
DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'iframe') {
    const el = node as Element;
    const src = el.getAttribute('src');
    if (src && !src.match(/^(https?:)?\/\/(www\.)?(youtube\.com|youtu\.be)\//)) {
      el.parentNode?.removeChild(el);
    }
  }
});

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Uses DOMPurify — never use regex-based sanitization for HTML.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'del',
      'ins',
      'ul',
      'ol',
      'li',
      'blockquote',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'a',
      'code',
      'pre',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'img',
      'figure',
      'figcaption',
      'div',
      'span',
      'hr',
      'iframe',
    ],
    ALLOWED_ATTR: [
      'href',
      'title',
      'alt',
      'src',
      'class',
      'id',
      'width',
      'height',
      'target',
      'rel',
      'allowfullscreen',
      'frameborder',
      'allow',
      'loading',
    ],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: true,
    FORBID_TAGS: [
      'style',
      'script',
      'object',
      'embed',
      'form',
      'input',
      'button',
      'textarea',
      'select',
    ],
    // Block ALL event handler attributes via regex hook below
  });
}

// Strip any remaining on* event attributes DOMPurify might miss
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  const el = node as Element;
  if (el.attributes) {
    Array.from(el.attributes).forEach((attr) => {
      if (/^on/i.test(attr.name)) {
        el.removeAttribute(attr.name);
      }
    });
  }
});

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
