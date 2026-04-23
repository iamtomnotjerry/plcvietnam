/**
 * Content Repository Interface
 * Defines the contract for data access operations
 * Requirements: 7.1, 7.4, 7.5, 7.6, 7.8
 */

import type {
  Field,
  Category,
  Post,
  Book,
  Comment,
  Tag,
  Author,
  NavigationNode,
  PostPublicationStatus,
  SEOMetadata,
} from '@/lib/types/domain';

/**
 * Query options for post listing operations
 */
export interface PostQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: 'publishedAt' | 'viewCount' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Query options for book listing operations
 */
export interface BookQueryOptions {
  page?: number;
  limit?: number;
  series?: string;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Search results grouped by content type
 */
export interface SearchResults {
  posts: Post[];
  books: Book[];
  totalResults: number;
}

/**
 * Input for creating a new comment
 */
export interface CreateCommentInput {
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
}

/**
 * Input for updating author information
 */
export interface UpdateAuthorInput {
  name: string;
  email: string;
  bio: string;
  avatarUrl?: string;
  expertise: string[];
  certifications: string[];
  socialLinks: {
    email?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

export type AdminPostStatusFilter = 'all' | 'draft' | 'published';

export interface AdminPostListOptions {
  status?: AdminPostStatusFilter;
  page?: number;
  limit?: number;
}

export interface CreatePostInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tagIds: string[];
  thumbnailUrl?: string;
  status: PostPublicationStatus;
  seo: SEOMetadata;
}

export interface UpdatePostInput {
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  categoryId?: string;
  tagIds?: string[];
  thumbnailUrl?: string | null;
  status?: PostPublicationStatus;
  seo?: Partial<SEOMetadata>;
}

/**
 * Content Repository Interface
 * Provides abstraction layer for all data operations
 */
export interface ContentRepository {
  // Fields
  getFields(): Promise<Field[]>;
  getFieldBySlug(slug: string): Promise<Field | null>;

  // Categories
  getCategoriesByFieldId(fieldId: string): Promise<Category[]>;
  getCategoryBySlug(fieldSlug: string, categorySlug: string): Promise<Category | null>;

  // Posts
  getPosts(options?: PostQueryOptions): Promise<PaginatedResult<Post>>;
  getPostBySlug(fieldSlug: string, categorySlug: string, postSlug: string): Promise<Post | null>;
  getPostsByCategory(
    categoryId: string,
    options?: PostQueryOptions
  ): Promise<PaginatedResult<Post>>;
  getPostsByTag(tagSlug: string, options?: PostQueryOptions): Promise<PaginatedResult<Post>>;
  getRelatedPosts(postId: string, limit: number): Promise<Post[]>;
  getRecentPosts(limit: number): Promise<Post[]>;
  incrementViewCount(postId: string): Promise<void>;

  /** CMS / admin (editor+admin roles) */
  listPostsForAdmin(options?: AdminPostListOptions): Promise<PaginatedResult<Post>>;
  getPostById(id: string): Promise<Post | null>;
  createPost(input: CreatePostInput): Promise<Post>;
  updatePost(id: string, input: UpdatePostInput): Promise<Post | null>;
  deletePost(id: string): Promise<boolean>;

  // Tags
  getTags(): Promise<Tag[]>;
  getTagBySlug(slug: string): Promise<Tag | null>;

  // Books
  getBooks(options?: BookQueryOptions): Promise<PaginatedResult<Book>>;
  getFeaturedBooks(limit: number): Promise<Book[]>;
  getBookBySlug(slug: string): Promise<Book | null>;

  // Comments
  getCommentsByPostId(postId: string): Promise<Comment[]>;
  createComment(comment: CreateCommentInput): Promise<Comment>;

  // Search
  search(query: string): Promise<SearchResults>;

  // Author
  getAuthor(): Promise<Author>;
  updateAuthor(input: UpdateAuthorInput): Promise<Author>;

  // Navigation
  getNavigationTree(): Promise<NavigationNode[]>;
}
