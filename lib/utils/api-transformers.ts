/**
 * API Response Transformers
 * Convert API responses (snake_case, ISO strings) to domain types (camelCase, Date objects)
 */

import type {
  ApiPost,
  ApiBook,
  ApiComment,
  ApiCategory,
  ApiField,
  ApiPaginatedResponse,
} from '@/lib/types/api';
import type { Post, Book, Comment, Category, Field } from '@/lib/types/domain';
import type { PaginatedResult } from '@/lib/data/repository';

/**
 * Transform API post to domain Post
 * Includes null safety and validation
 */
export function transformPost(
  apiPost: ApiPost
): Omit<Post, 'category' | 'author' | 'tags' | 'readingTimeMinutes'> {
  // Validate required fields
  if (!apiPost.id || !apiPost.slug || !apiPost.title) {
    throw new Error('Invalid API response: missing required post fields');
  }

  // Validate and parse dates
  const publishedAt = new Date(apiPost.published_at);
  const updatedAt = new Date(apiPost.updated_at);

  if (isNaN(publishedAt.getTime())) {
    throw new Error(`Invalid published_at date: ${apiPost.published_at}`);
  }

  if (isNaN(updatedAt.getTime())) {
    throw new Error(`Invalid updated_at date: ${apiPost.updated_at}`);
  }

  // Safe SEO handling
  const seoKeywords = apiPost.seo?.keywords;
  const keywords = Array.isArray(seoKeywords) ? seoKeywords : [];

  return {
    id: apiPost.id,
    slug: apiPost.slug,
    title: apiPost.title,
    excerpt: apiPost.excerpt || '',
    content: apiPost.content || '',
    thumbnailUrl: apiPost.thumbnail_url || undefined,
    categoryId: apiPost.category_id,
    authorId: apiPost.author_id,
    status: apiPost.status || 'published',
    publishedAt,
    updatedAt,
    viewCount: apiPost.view_count || 0,
    seo: {
      title: apiPost.seo?.title || apiPost.title,
      description: apiPost.seo?.description || apiPost.excerpt || '',
      ogImage: apiPost.seo?.og_image,
      keywords,
    },
  };
}

/**
 * Transform API book to domain Book
 * Includes null safety and validation
 */
export function transformBook(apiBook: ApiBook): Book {
  // Validate required fields
  if (!apiBook.id || !apiBook.slug || !apiBook.title) {
    throw new Error('Invalid API response: missing required book fields');
  }

  // Validate date
  const createdAt = new Date(apiBook.created_at);
  if (isNaN(createdAt.getTime())) {
    throw new Error(`Invalid created_at date: ${apiBook.created_at}`);
  }

  return {
    id: apiBook.id,
    slug: apiBook.slug,
    title: apiBook.title,
    description: apiBook.description || '',
    coverImageUrl: apiBook.cover_image_url,
    authorName: apiBook.author_name,
    series: apiBook.series,
    downloadUrl: apiBook.download_url,
    externalUrl: apiBook.external_url,
    publishedYear: apiBook.published_year,
    createdAt,
  };
}

/**
 * Transform API comment to domain Comment
 * Includes null safety and validation
 */
export function transformComment(apiComment: ApiComment): Comment {
  // Validate required fields
  if (!apiComment.id || !apiComment.post_id || !apiComment.user_id) {
    throw new Error('Invalid API response: missing required comment fields');
  }

  // Validate dates
  const createdAt = new Date(apiComment.created_at);
  const updatedAt = new Date(apiComment.updated_at);

  if (isNaN(createdAt.getTime())) {
    throw new Error(`Invalid created_at date: ${apiComment.created_at}`);
  }

  if (isNaN(updatedAt.getTime())) {
    throw new Error(`Invalid updated_at date: ${apiComment.updated_at}`);
  }

  return {
    id: apiComment.id,
    postId: apiComment.post_id,
    userId: apiComment.user_id,
    userName: apiComment.user_name || 'Anonymous',
    userAvatar: apiComment.user_avatar,
    content: apiComment.content || '',
    createdAt,
    updatedAt,
  };
}

/**
 * Transform API category to domain Category
 */
export function transformCategory(apiCategory: ApiCategory): Omit<Category, 'field'> {
  return {
    id: apiCategory.id,
    slug: apiCategory.slug,
    name: apiCategory.name,
    description: apiCategory.description,
    fieldId: apiCategory.field_id,
    postCount: apiCategory.post_count,
    order: apiCategory.order,
    createdAt: new Date(apiCategory.created_at),
    updatedAt: new Date(apiCategory.updated_at),
  };
}

/**
 * Transform API field to domain Field
 */
export function transformField(apiField: ApiField): Field {
  return {
    id: apiField.id,
    slug: apiField.slug,
    name: apiField.name,
    description: apiField.description,
    icon: apiField.icon,
    postCount: apiField.post_count,
    createdAt: new Date(apiField.created_at),
    updatedAt: new Date(apiField.updated_at),
  };
}

/**
 * Transform paginated API response to domain PaginatedResult
 * Includes validation
 */
export function transformPaginatedResponse<TApi, TDomain>(
  apiResponse: ApiPaginatedResponse<TApi>,
  transformer: (item: TApi) => TDomain
): PaginatedResult<TDomain> {
  // Validate response structure
  if (!apiResponse || !Array.isArray(apiResponse.data)) {
    throw new Error('Invalid API response: data is not an array');
  }

  if (!apiResponse.meta || typeof apiResponse.meta.page !== 'number') {
    throw new Error('Invalid API response: missing pagination metadata');
  }

  return {
    data: apiResponse.data.map(transformer),
    pagination: {
      page: apiResponse.meta.page,
      limit: apiResponse.meta.limit,
      total: apiResponse.meta.total,
      totalPages: apiResponse.meta.total_pages,
    },
  };
}
