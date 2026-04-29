/**
 * Client-side HTML Sanitization using DOMPurify
 * Only use this in client components (with 'use client' directive)
 */

'use client';

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
 * Sanitize HTML content using DOMPurify (client-side only).
 * This provides proper HTML parsing and sanitization.
 */
export function sanitizeHtmlClient(html: string): string {
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
  });
}
