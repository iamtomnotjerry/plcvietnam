/**
 * API Provider Implementation Example
 *
 * This is a complete example of how to implement the API provider.
 * Copy this file to index.ts and customize for your backend.
 *
 * Steps to use:
 * 1. Copy this file to lib/data/providers/api/index.ts
 * 2. Update API_BASE_URL in .env
 * 3. Customize error handling if needed
 * 4. Update factory.ts to include 'api' case
 * 5. Set DATA_PROVIDER=api in .env
 */

import type {
  ContentRepository,
  PaginatedResult,
  SearchResults,
  PostQueryOptions,
  BookQueryOptions,
  CreateCommentInput,
  AdminPostListOptions,
  CreatePostInput,
  UpdatePostInput,
  UpdateAuthorInput,
} from '../../repository';
import type {
  Field,
  Category,
  Post,
  Book,
  Comment,
  Tag,
  Author,
  NavigationNode,
} from '@/lib/types/domain';
import type {
  ApiPost,
  ApiBook,
  ApiComment,
  ApiCategory,
  ApiField,
  ApiPaginatedResponse,
} from '@/lib/types/api';
import {
  transformPost,
  transformBook,
  transformComment,
  transformCategory,
  transformField,
  transformPaginatedResponse,
} from '@/lib/utils/api-transformers';
import { calculateReadingTime } from '@/features/posts/utils/readingTime';

type ApiFieldWithFirstCategory = ApiField & { firstCategorySlug?: string };

export class APIProvider implements ContentRepository {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Fields
  async getFields(): Promise<Field[]> {
    const apiFields = await this.fetchAPI<ApiField[]>('/api/fields');
    return apiFields.map(transformField);
  }

  async getFieldBySlug(slug: string): Promise<Field | null> {
    try {
      const apiField = await this.fetchAPI<ApiField>(`/api/fields/${slug}`);
      return transformField(apiField);
    } catch {
      return null;
    }
  }

  async getFieldsWithFirstCategory(): Promise<Array<Field & { firstCategorySlug?: string }>> {
    const apiFields = await this.fetchAPI<ApiFieldWithFirstCategory[]>(
      '/api/fields?include=firstCategory'
    );
    return apiFields.map((f) => ({
      ...transformField(f),
      firstCategorySlug: f.firstCategorySlug,
    }));
  }

  // Categories
  async getCategoriesByFieldId(fieldId: string): Promise<Category[]> {
    const apiCategories = await this.fetchAPI<ApiCategory[]>(`/api/categories?field_id=${fieldId}`);
    return apiCategories.map(transformCategory);
  }

  async getCategoryBySlug(fieldSlug: string, categorySlug: string): Promise<Category | null> {
    try {
      const apiCategory = await this.fetchAPI<ApiCategory>(
        `/api/fields/${fieldSlug}/categories/${categorySlug}`
      );
      return transformCategory(apiCategory);
    } catch {
      return null;
    }
  }

  // Posts
  async getPosts(options?: PostQueryOptions): Promise<PaginatedResult<Post>> {
    const params = new URLSearchParams({
      page: String(options?.page || 1),
      limit: String(options?.limit || 20),
      sort_by: options?.sortBy || 'publishedAt',
      sort_order: options?.sortOrder || 'desc',
    });

    const apiResponse = await this.fetchAPI<ApiPaginatedResponse<ApiPost>>(`/api/posts?${params}`);

    return transformPaginatedResponse(apiResponse, (apiPost) => {
      const post = transformPost(apiPost);
      return {
        ...post,
        readingTimeMinutes: calculateReadingTime(post.content),
        tags: [], // Will be populated by separate call if needed
        category: undefined,
        author: undefined,
      } as Post;
    });
  }

  async getPostBySlug(
    fieldSlug: string,
    categorySlug: string,
    postSlug: string
  ): Promise<Post | null> {
    try {
      const apiPost = await this.fetchAPI<ApiPost>(
        `/api/fields/${fieldSlug}/categories/${categorySlug}/posts/${postSlug}`
      );

      const post = transformPost(apiPost);
      return {
        ...post,
        readingTimeMinutes: calculateReadingTime(post.content),
        tags: [], // Populate from API if available
        category: undefined,
        author: undefined,
      } as Post;
    } catch {
      return null;
    }
  }

  async getPostsByCategory(
    categoryId: string,
    options?: PostQueryOptions
  ): Promise<PaginatedResult<Post>> {
    const params = new URLSearchParams({
      category_id: categoryId,
      page: String(options?.page || 1),
      limit: String(options?.limit || 20),
      sort_by: options?.sortBy || 'publishedAt',
      sort_order: options?.sortOrder || 'desc',
    });

    const apiResponse = await this.fetchAPI<ApiPaginatedResponse<ApiPost>>(`/api/posts?${params}`);

    return transformPaginatedResponse(apiResponse, (apiPost) => {
      const post = transformPost(apiPost);
      return {
        ...post,
        readingTimeMinutes: calculateReadingTime(post.content),
        tags: [],
        category: undefined,
        author: undefined,
      } as Post;
    });
  }

  async getPostsByTag(tagSlug: string, options?: PostQueryOptions): Promise<PaginatedResult<Post>> {
    const params = new URLSearchParams({
      tag: tagSlug,
      page: String(options?.page || 1),
      limit: String(options?.limit || 20),
      sort_by: options?.sortBy || 'publishedAt',
      sort_order: options?.sortOrder || 'desc',
    });

    const apiResponse = await this.fetchAPI<ApiPaginatedResponse<ApiPost>>(`/api/posts?${params}`);

    return transformPaginatedResponse(apiResponse, (apiPost) => {
      const post = transformPost(apiPost);
      return {
        ...post,
        readingTimeMinutes: calculateReadingTime(post.content),
        tags: [],
        category: undefined,
        author: undefined,
      } as Post;
    });
  }

  async getRelatedPosts(postId: string, limit: number): Promise<Post[]> {
    const apiPosts = await this.fetchAPI<ApiPost[]>(`/api/posts/${postId}/related?limit=${limit}`);

    return apiPosts.map((apiPost) => {
      const post = transformPost(apiPost);
      return {
        ...post,
        readingTimeMinutes: calculateReadingTime(post.content),
        tags: [],
        category: undefined,
        author: undefined,
      } as Post;
    });
  }

  async getRecentPosts(limit: number): Promise<Post[]> {
    const apiPosts = await this.fetchAPI<ApiPost[]>(`/api/posts/recent?limit=${limit}`);

    return apiPosts.map((apiPost) => {
      const post = transformPost(apiPost);
      return {
        ...post,
        readingTimeMinutes: calculateReadingTime(post.content),
        tags: [],
        category: undefined,
        author: undefined,
      } as Post;
    });
  }

  async incrementViewCount(postId: string): Promise<void> {
    await this.fetchAPI(`/api/posts/${postId}/views`, {
      method: 'POST',
    });
  }

  // Admin Posts
  async listPostsForAdmin(options?: AdminPostListOptions): Promise<PaginatedResult<Post>> {
    const params = new URLSearchParams({
      status: options?.status || 'all',
      page: String(options?.page || 1),
      limit: String(options?.limit || 50),
    });
    if (options?.search?.trim()) {
      params.set('q', options.search.trim());
    }

    const apiResponse = await this.fetchAPI<ApiPaginatedResponse<ApiPost>>(
      `/api/admin/posts?${params}`
    );

    return transformPaginatedResponse(apiResponse, (apiPost) => {
      const post = transformPost(apiPost);
      return {
        ...post,
        readingTimeMinutes: calculateReadingTime(post.content),
        tags: [],
        category: undefined,
        author: undefined,
      } as Post;
    });
  }

  async getPostById(id: string): Promise<Post | null> {
    try {
      const apiPost = await this.fetchAPI<ApiPost>(`/api/posts/${id}`);
      const post = transformPost(apiPost);
      return {
        ...post,
        readingTimeMinutes: calculateReadingTime(post.content),
        tags: [],
        category: undefined,
        author: undefined,
      } as Post;
    } catch {
      return null;
    }
  }

  async createPost(input: CreatePostInput): Promise<Post> {
    const apiPost = await this.fetchAPI<ApiPost>('/api/admin/posts', {
      method: 'POST',
      body: JSON.stringify({
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        category_id: input.categoryId,
        tag_ids: input.tagIds,
        thumbnail_url: input.thumbnailUrl,
        status: input.status,
        seo: input.seo,
      }),
    });

    const post = transformPost(apiPost);
    return {
      ...post,
      readingTimeMinutes: calculateReadingTime(post.content),
      tags: [],
      category: undefined,
      author: undefined,
    } as Post;
  }

  async updatePost(id: string, input: UpdatePostInput): Promise<Post | null> {
    try {
      const apiPost = await this.fetchAPI<ApiPost>(`/api/admin/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          slug: input.slug,
          title: input.title,
          excerpt: input.excerpt,
          content: input.content,
          category_id: input.categoryId,
          tag_ids: input.tagIds,
          thumbnail_url: input.thumbnailUrl,
          status: input.status,
          seo: input.seo,
        }),
      });

      const post = transformPost(apiPost);
      return {
        ...post,
        readingTimeMinutes: calculateReadingTime(post.content),
        tags: [],
        category: undefined,
        author: undefined,
      } as Post;
    } catch {
      return null;
    }
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      await this.fetchAPI(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch {
      return false;
    }
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    return this.fetchAPI<Tag[]>('/api/tags');
  }

  async getTagBySlug(slug: string): Promise<Tag | null> {
    try {
      return await this.fetchAPI<Tag>(`/api/tags/${slug}`);
    } catch {
      return null;
    }
  }

  // Books
  async getBooks(options?: BookQueryOptions): Promise<PaginatedResult<Book>> {
    const params = new URLSearchParams({
      page: String(options?.page || 1),
      limit: String(options?.limit || 12),
    });

    if (options?.series) {
      params.append('series', options.series);
    }

    const apiResponse = await this.fetchAPI<ApiPaginatedResponse<ApiBook>>(`/api/books?${params}`);

    return transformPaginatedResponse(apiResponse, transformBook);
  }

  async getFeaturedBooks(limit: number): Promise<Book[]> {
    const apiBooks = await this.fetchAPI<ApiBook[]>(`/api/books/featured?limit=${limit}`);
    return apiBooks.map(transformBook);
  }

  async getBookBySlug(slug: string): Promise<Book | null> {
    try {
      const apiBook = await this.fetchAPI<ApiBook>(`/api/books/${slug}`);
      return transformBook(apiBook);
    } catch {
      return null;
    }
  }

  // Comments
  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    const apiComments = await this.fetchAPI<ApiComment[]>(`/api/comments?post_id=${postId}`);
    return apiComments.map(transformComment);
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    const apiComment = await this.fetchAPI<ApiComment>('/api/comments', {
      method: 'POST',
      body: JSON.stringify({
        post_id: input.postId,
        user_id: input.userId,
        user_name: input.userName,
        user_avatar: input.userAvatar,
        content: input.content,
      }),
    });

    return transformComment(apiComment);
  }

  // Search
  async search(query: string): Promise<SearchResults> {
    const results = await this.fetchAPI<{
      posts: ApiPost[];
      books: ApiBook[];
      total_results: number;
    }>(`/api/search?q=${encodeURIComponent(query)}`);

    return {
      posts: results.posts.map((apiPost) => {
        const post = transformPost(apiPost);
        return {
          ...post,
          readingTimeMinutes: calculateReadingTime(post.content),
          tags: [],
          category: undefined,
          author: undefined,
        } as Post;
      }),
      books: results.books.map(transformBook),
      totalResults: results.total_results,
    };
  }

  // Author
  async getAuthor(): Promise<Author> {
    return this.fetchAPI<Author>('/api/author');
  }

  async updateAuthor(input: UpdateAuthorInput): Promise<Author> {
    return this.fetchAPI<Author>('/api/admin/author', {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  // Navigation
  async getNavigationTree(): Promise<NavigationNode[]> {
    return this.fetchAPI<NavigationNode[]>('/api/navigation');
  }
}
