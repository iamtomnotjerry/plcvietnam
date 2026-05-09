import { describe, it, expect } from 'vitest';
import {
  validateComment,
  commentSchema,
  COMMENT_VALIDATION_MESSAGE_KEYS,
  COMMENT_MIN_LENGTH,
  COMMENT_MAX_LENGTH,
} from './validation';

describe('validateComment', () => {
  describe('valid comments', () => {
    it('accepts a single character', () => {
      const result = validateComment('a');
      expect(result.valid).toBe(true);
      expect(result.errorKey).toBeUndefined();
    });

    it('accepts a typical comment', () => {
      const result = validateComment('Bài viết rất hay, cảm ơn tác giả!');
      expect(result.valid).toBe(true);
    });

    it('accepts exactly 2000 characters', () => {
      const content = 'a'.repeat(COMMENT_MAX_LENGTH);
      const result = validateComment(content);
      expect(result.valid).toBe(true);
    });

    it('accepts exactly 1 character (minimum boundary)', () => {
      const result = validateComment('x');
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid comments - empty', () => {
    it('rejects an empty string', () => {
      const result = validateComment('');
      expect(result.valid).toBe(false);
      expect(result.errorKey).toBe(COMMENT_VALIDATION_MESSAGE_KEYS.empty);
    });

    it('returns the validation message key for empty comment', () => {
      const result = validateComment('');
      expect(result.errorKey).toBe('validationEmpty');
    });
  });

  describe('invalid comments - too long', () => {
    it('rejects a comment with 2001 characters', () => {
      const content = 'a'.repeat(COMMENT_MAX_LENGTH + 1);
      const result = validateComment(content);
      expect(result.valid).toBe(false);
      expect(result.errorKey).toBe(COMMENT_VALIDATION_MESSAGE_KEYS.tooLong);
    });

    it('rejects a very long comment', () => {
      const content = 'a'.repeat(5000);
      const result = validateComment(content);
      expect(result.valid).toBe(false);
      expect(result.errorKey).toBe('validationTooLong');
    });
  });

  describe('boundary values', () => {
    it('accepts length 1 (lower boundary)', () => {
      expect(validateComment('a').valid).toBe(true);
    });

    it('accepts length 2000 (upper boundary)', () => {
      expect(validateComment('a'.repeat(2000)).valid).toBe(true);
    });

    it('rejects length 0 (below lower boundary)', () => {
      expect(validateComment('').valid).toBe(false);
    });

    it('rejects length 2001 (above upper boundary)', () => {
      expect(validateComment('a'.repeat(2001)).valid).toBe(false);
    });
  });
});

describe('commentSchema', () => {
  describe('parse', () => {
    it('returns data for valid comment', () => {
      const data = { content: 'Valid comment' };
      expect(commentSchema.parse(data)).toEqual(data);
    });

    it('throws for empty comment', () => {
      expect(() => commentSchema.parse({ content: '' })).toThrow(
        COMMENT_VALIDATION_MESSAGE_KEYS.empty
      );
    });

    it('throws for too-long comment', () => {
      expect(() => commentSchema.parse({ content: 'a'.repeat(2001) })).toThrow(
        COMMENT_VALIDATION_MESSAGE_KEYS.tooLong
      );
    });
  });

  describe('safeParse', () => {
    it('returns success:true for valid comment', () => {
      const data = { content: 'Valid comment' };
      const result = commentSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('returns success:false with error message key for empty comment', () => {
      const result = commentSchema.safeParse({ content: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe(COMMENT_VALIDATION_MESSAGE_KEYS.empty);
      }
    });

    it('returns success:false with error message key for too-long comment', () => {
      const result = commentSchema.safeParse({ content: 'a'.repeat(2001) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe(COMMENT_VALIDATION_MESSAGE_KEYS.tooLong);
      }
    });
  });
});

describe('constants', () => {
  it('COMMENT_MIN_LENGTH is 1', () => {
    expect(COMMENT_MIN_LENGTH).toBe(1);
  });

  it('COMMENT_MAX_LENGTH is 2000', () => {
    expect(COMMENT_MAX_LENGTH).toBe(2000);
  });
});
