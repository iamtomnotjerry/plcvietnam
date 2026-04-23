/**
 * Property-Based Tests for Reading Time Calculation
 * Feature: automation-blog, Property 1: Reading Time Calculation Correctness
 * 
 * **Validates: Requirements 13.2**
 * 
 * For any post content string, the calculated reading time SHALL equal 
 * the ceiling of (word count / 200) with a minimum value of 1 minute.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { calculateReadingTime } from '../readingTime';

describe('Property: Reading Time Calculation', () => {
  it('should calculate reading time as ceil(wordCount / 200) with minimum 1', () => {
    fc.assert(
      fc.property(
        fc.string(),  // Generate random content
        (content) => {
          const result = calculateReadingTime(content);
          
          // Calculate expected value using the same algorithm
          const plainText = content.replace(/<[^>]*>/g, '');
          const normalized = plainText.replace(/\s+/g, ' ').trim();
          const wordCount = normalized.split(' ').filter(w => w.length > 0).length;
          const expected = Math.max(1, Math.ceil(wordCount / 200));
          
          // Verify the result matches the formula
          expect(result).toBe(expected);
          
          // Verify minimum value constraint
          expect(result).toBeGreaterThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always return at least 1 minute for any input', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (content) => {
          const result = calculateReadingTime(content);
          expect(result).toBeGreaterThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle HTML content correctly by stripping tags', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1, maxLength: 50 }).map(words => 
          words.map(w => `<p>${w}</p>`).join('')
        ),
        (htmlContent) => {
          const result = calculateReadingTime(htmlContent);
          
          // Calculate expected by stripping HTML
          const plainText = htmlContent.replace(/<[^>]*>/g, '');
          const normalized = plainText.replace(/\s+/g, ' ').trim();
          const wordCount = normalized.split(' ').filter(w => w.length > 0).length;
          const expected = Math.max(1, Math.ceil(wordCount / 200));
          
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should normalize whitespace before counting words', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 100 }),
        fc.constantFrom(' ', '  ', '\n', '\t', '\n\n', '   '),
        (words, separator) => {
          const content = words.join(separator);
          const result = calculateReadingTime(content);
          
          // Expected: normalize whitespace then count
          const normalized = content.replace(/\s+/g, ' ').trim();
          const wordCount = normalized.split(' ').filter(w => w.length > 0).length;
          const expected = Math.max(1, Math.ceil(wordCount / 200));
          
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce consistent results for the same input', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (content) => {
          const result1 = calculateReadingTime(content);
          const result2 = calculateReadingTime(content);
          
          // Same input should always produce same output (determinism)
          expect(result1).toBe(result2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should round up partial minutes correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        (wordCount) => {
          // Generate content with exact word count
          const content = Array(wordCount).fill('word').join(' ');
          const result = calculateReadingTime(content);
          
          // Expected: ceil(wordCount / 200) with minimum 1
          const expected = Math.max(1, Math.ceil(wordCount / 200));
          
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge cases: empty strings and whitespace-only content', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', '   ', '\n\n', '\t\t', '  \n  \t  '),
        (content) => {
          const result = calculateReadingTime(content);
          
          // Empty or whitespace-only content should return minimum 1 minute
          expect(result).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle content with mixed HTML tags and text', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            tag: fc.constantFrom('p', 'div', 'span', 'h1', 'h2', 'strong', 'em'),
            text: fc.string({ minLength: 1, maxLength: 20 })
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (elements) => {
          const htmlContent = elements
            .map(el => `<${el.tag}>${el.text}</${el.tag}>`)
            .join('');
          
          const result = calculateReadingTime(htmlContent);
          
          // Calculate expected by stripping HTML
          const plainText = htmlContent.replace(/<[^>]*>/g, '');
          const normalized = plainText.replace(/\s+/g, ' ').trim();
          const wordCount = normalized.split(' ').filter(w => w.length > 0).length;
          const expected = Math.max(1, Math.ceil(wordCount / 200));
          
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });
});
