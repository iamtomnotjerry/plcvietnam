/**
 * Property-Based Tests for URL Generation
 * Feature: automation-blog, Property 6: URL Generation Pattern Consistency
 * Validates: Requirements 10.1
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generatePostUrl } from '@/lib/utils/urlGeneration';

const slugArbitrary = fc.string({ minLength: 1, maxLength: 50 });

describe('Property 6: URL Generation Pattern Consistency', () => {
  it('should always produce a URL matching /fields/{field}/{category}/{post}', () => {
    fc.assert(
      fc.property(slugArbitrary, slugArbitrary, slugArbitrary, (fieldSlug, categorySlug, postSlug) => {
        const url = generatePostUrl(fieldSlug, categorySlug, postSlug);
        expect(url.startsWith('/fields/')).toBe(true);
        const parts = url.split('/');
        expect(parts.length).toBe(5);
        expect(parts[1]).toBe('fields');
      }),
      { numRuns: 100 }
    );
  });

  it('should properly URL-encode each slug segment', () => {
    fc.assert(
      fc.property(slugArbitrary, slugArbitrary, slugArbitrary, (fieldSlug, categorySlug, postSlug) => {
        const url = generatePostUrl(fieldSlug, categorySlug, postSlug);
        const parts = url.split('/');
        expect(decodeURIComponent(parts[2])).toBe(fieldSlug);
        expect(decodeURIComponent(parts[3])).toBe(categorySlug);
        expect(decodeURIComponent(parts[4])).toBe(postSlug);
      }),
      { numRuns: 100 }
    );
  });

  it('should produce consistent results for the same inputs', () => {
    fc.assert(
      fc.property(slugArbitrary, slugArbitrary, slugArbitrary, (fieldSlug, categorySlug, postSlug) => {
        expect(generatePostUrl(fieldSlug, categorySlug, postSlug))
          .toBe(generatePostUrl(fieldSlug, categorySlug, postSlug));
      }),
      { numRuns: 100 }
    );
  });

  it('should handle typical slug characters without encoding', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z0-9-]{1,30}$/),
        fc.stringMatching(/^[a-z0-9-]{1,30}$/),
        fc.stringMatching(/^[a-z0-9-]{1,30}$/),
        (fieldSlug, categorySlug, postSlug) => {
          const url = generatePostUrl(fieldSlug, categorySlug, postSlug);
          expect(url).toBe(`/fields/${fieldSlug}/${categorySlug}/${postSlug}`);
        }
      ),
      { numRuns: 100 }
    );
  });
});
