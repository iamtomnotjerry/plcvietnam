/**
 * Property-Based Tests for Comment Validation
 * Feature: automation-blog, Property 2: Comment Validation Boundaries
 *
 * **Validates: Requirements 4.5, 4.6, 4.7**
 *
 * For any string with length in [1, 2000]: validateComment returns valid=true
 * For any string with length 0: validateComment returns valid=false with validationEmpty key
 * For any string with length > 2000: validateComment returns valid=false with validationTooLong key
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  validateComment,
  COMMENT_VALIDATION_MESSAGE_KEYS,
  COMMENT_MIN_LENGTH,
  COMMENT_MAX_LENGTH,
} from '../validation';

describe('Property: Comment Validation Boundaries', () => {
  it('should accept any string with length in [1, 2000]', () => {
    fc.assert(
      fc.property(
        // Generate strings with length between 1 and 2000 (inclusive)
        fc.string({ minLength: COMMENT_MIN_LENGTH, maxLength: COMMENT_MAX_LENGTH }),
        (content) => {
          const result = validateComment(content);

          expect(result.valid).toBe(true);
          expect(result.errorKey).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject empty string (length 0) with the correct error key', () => {
    fc.assert(
      fc.property(
        // Only the empty string has length 0
        fc.constant(''),
        (content) => {
          const result = validateComment(content);

          expect(result.valid).toBe(false);
          expect(result.errorKey).toBe(COMMENT_VALIDATION_MESSAGE_KEYS.empty);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject any string with length > 2000 with the correct error key', () => {
    fc.assert(
      fc.property(
        // Generate strings longer than 2000 characters (2001 to 5000)
        fc
          .integer({ min: COMMENT_MAX_LENGTH + 1, max: 5000 })
          .chain((len) => fc.string({ minLength: len, maxLength: len })),
        (content) => {
          const result = validateComment(content);

          expect(result.valid).toBe(false);
          expect(result.errorKey).toBe(COMMENT_VALIDATION_MESSAGE_KEYS.tooLong);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce consistent results for the same input (determinism)', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.string({ minLength: 1, maxLength: 2000 }),
          fc.string({ minLength: 2001, maxLength: 5000 })
        ),
        (content) => {
          const result1 = validateComment(content);
          const result2 = validateComment(content);

          expect(result1.valid).toBe(result2.valid);
          expect(result1.errorKey).toBe(result2.errorKey);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly classify strings at boundary lengths (0, 1, 2000, 2001)', () => {
    fc.assert(
      fc.property(fc.constantFrom(0, 1, 1000, 2000, 2001, 5000), (length) => {
        const content = 'a'.repeat(length);
        const result = validateComment(content);

        if (length === 0) {
          expect(result.valid).toBe(false);
          expect(result.errorKey).toBe(COMMENT_VALIDATION_MESSAGE_KEYS.empty);
        } else if (length >= 1 && length <= 2000) {
          expect(result.valid).toBe(true);
          expect(result.errorKey).toBeUndefined();
        } else {
          // length > 2000
          expect(result.valid).toBe(false);
          expect(result.errorKey).toBe(COMMENT_VALIDATION_MESSAGE_KEYS.tooLong);
        }
      }),
      { numRuns: 100 }
    );
  });
});
