/**
 * API Response Types
 * These types match expected API response structures
 * Use these when implementing real API provider
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
  meta?: ApiMeta;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * API metadata (pagination, etc.)
 */
export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

/**
 * API date strings (ISO 8601)
 * Backend sends dates as strings, we convert to Date objects
 */
export type ApiDateString = string;

/**
 * Raw API response types (before transformation)
 * These match what the backend sends
 */
export interface ApiPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnail_url?: string; // snake_case from API
  category_id: string;
  author_id: string;
  // NOTE: Backend should return full tag objects, not just IDs
  // If backend returns tag_ids: string[], update this type accordingly
  tags: Array<{
    id: string;
    slug: string;
    name: string;
    post_count: number;
  }>;
  status?: 'draft' | 'published';
  published_at: ApiDateString; // ISO string from API
  updated_at: ApiDateString;
  view_count: number;
  seo: {
    title: string;
    description: string;
    og_image?: string;
    keywords: string[];
  };
}

export interface ApiBook {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_image_url: string;
  author_name: string;
  series?: string;
  download_url?: string;
  external_url?: string;
  published_year?: number;
  created_at: ApiDateString;
}

export interface ApiComment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: ApiDateString;
  updated_at: ApiDateString;
}

export interface ApiCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  field_id: string;
  post_count: number;
  order: number;
  created_at: ApiDateString;
  updated_at: ApiDateString;
}

export interface ApiField {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon?: string;
  post_count: number;
  created_at: ApiDateString;
  updated_at: ApiDateString;
}

/**
 * Paginated API response
 */
export interface ApiPaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
