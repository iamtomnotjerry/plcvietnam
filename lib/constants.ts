/**
 * Application Constants
 * Centralized configuration values
 */

/**
 * Reading time calculation
 */
export const READING_SPEED = {
  WORDS_PER_MINUTE: 200,
  MIN_READING_TIME: 1,
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  POSTS_PER_PAGE: 12,
  BOOKS_PER_PAGE: 12,
  COMMENTS_PER_PAGE: 20,
  ADMIN_POSTS_PER_PAGE: 50,
} as const;

/**
 * Validation rules
 */
export const VALIDATION = {
  COMMENT_MIN_LENGTH: 1,
  COMMENT_MAX_LENGTH: 2000,
  SEARCH_MIN_LENGTH: 2,
  POST_TITLE_MAX_LENGTH: 200,
  POST_EXCERPT_MAX_LENGTH: 500,
} as const;

/**
 * Cache durations (in seconds)
 */
export const CACHE = {
  POSTS_REVALIDATE: 3600, // 1 hour
  BOOKS_REVALIDATE: 86400, // 24 hours
  NAVIGATION_REVALIDATE: 3600, // 1 hour
  AUTHOR_REVALIDATE: 86400, // 24 hours
} as const;

/**
 * API endpoints (for future API provider)
 */
export const API_ENDPOINTS = {
  POSTS: '/api/posts',
  BOOKS: '/api/books',
  COMMENTS: '/api/comments',
  TAGS: '/api/tags',
  CATEGORIES: '/api/categories',
  FIELDS: '/api/fields',
  AUTHOR: '/api/author',
  SEARCH: '/api/search',
  NAVIGATION: '/api/navigation',
} as const;

/**
 * Related posts configuration
 */
export const RELATED_POSTS = {
  DEFAULT_LIMIT: 4,
  SHARED_TAG_SCORE: 2,
  SAME_CATEGORY_SCORE: 1,
} as const;
