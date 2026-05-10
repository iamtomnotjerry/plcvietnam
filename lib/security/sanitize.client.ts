/**
 * Client-side HTML Sanitization using DOMPurify
 * Only use this in client components (with 'use client' directive)
 */

'use client';

import DOMPurify from 'isomorphic-dompurify';

// Enforce YouTube-only iframes (incl. youtube-nocookie)
DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'iframe') {
    const el = node as Element;
    const src = el.getAttribute('src');
    if (
      src &&
      !src.match(/^(https?:)?\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)(\/|$)/i)
    ) {
      el.parentNode?.removeChild(el);
    }
  }
});

// Allow only safe inline/layout styles (TipTap text-align, tables, optional highlight color)
DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
  if (data.attrName !== 'style') return;
  const el = node as Element;
  const tag = el.tagName?.toLowerCase() ?? '';
  const v = String(data.attrValue ?? '').trim();
  if (/expression|url\s*\(|javascript:/i.test(v)) {
    data.keepAttr = false;
    return;
  }

  const textAlignOnly = /^\s*text-align:\s*(left|center|right|justify)\s*;?\s*$/i.test(v);
  if (
    textAlignOnly &&
    ['p', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'td', 'th', 'div'].includes(tag)
  ) {
    return;
  }

  const tableSizing = tag === 'table' && /^\s*((width|min-width):\s*[^;]+;?\s*)+$/i.test(v);
  if (tableSizing) return;

  const colSizing = tag === 'col' && /^\s*((width|min-width):\s*[\d.\s%px]+;?\s*)+$/i.test(v);
  if (colSizing) return;

  const markHighlight =
    tag === 'mark' && /^\s*background-color:\s*[^;]+;\s*color:\s*inherit\s*;?\s*$/i.test(v);
  if (markHighlight) return;

  data.keepAttr = false;
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
      'mark',
      'colgroup',
      'col',
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
      'style',
      'colspan',
      'rowspan',
      'scope',
      'data-youtube-video',
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
