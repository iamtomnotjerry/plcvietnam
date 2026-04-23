/**
 * Comment validation utility
 * Validates comment content according to requirements 4.5, 4.6, 4.7
 */

export const COMMENT_MIN_LENGTH = 1;
export const COMMENT_MAX_LENGTH = 2000;

export const COMMENT_VALIDATION_MESSAGES = {
  empty: 'Bình luận không được để trống',
  tooLong: 'Bình luận không được vượt quá 2000 ký tự',
} as const;

export interface CommentValidationResult {
  valid: boolean;
  error?: string;
}

export interface CommentSchema {
  content: string;
}

/**
 * Validates a comment string against the defined rules:
 * - Must have at least 1 character (not empty)
 * - Must not exceed 2000 characters
 *
 * @param content - The comment text to validate
 * @returns A validation result with `valid` flag and optional `error` message
 */
export function validateComment(content: string): CommentValidationResult {
  if (content.length < COMMENT_MIN_LENGTH) {
    return {
      valid: false,
      error: COMMENT_VALIDATION_MESSAGES.empty,
    };
  }

  if (content.length > COMMENT_MAX_LENGTH) {
    return {
      valid: false,
      error: COMMENT_VALIDATION_MESSAGES.tooLong,
    };
  }

  return { valid: true };
}

/**
 * Schema-like object that mirrors Zod's API surface for easy future migration.
 * Provides a `parse` method that throws on invalid input and a `safeParse`
 * method that returns a result object.
 */
export const commentSchema = {
  /**
   * Parses and validates comment data, throwing an error if invalid.
   */
  parse(data: CommentSchema): CommentSchema {
    const result = validateComment(data.content);
    if (!result.valid) {
      throw new Error(result.error);
    }
    return data;
  },

  /**
   * Parses and validates comment data, returning a result object instead of throwing.
   */
  safeParse(
    data: CommentSchema
  ): { success: true; data: CommentSchema } | { success: false; error: { message: string } } {
    const result = validateComment(data.content);
    if (!result.valid) {
      return { success: false, error: { message: result.error! } };
    }
    return { success: true, data };
  },
};
