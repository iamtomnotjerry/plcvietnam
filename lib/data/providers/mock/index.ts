/**
 * Mock Data Provider Implementation
 * Implements ContentRepository using static JSON files
 * Requirements: 7.2, 7.8
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

// Import mock data
import fieldsData from '@/public/mock-data/fields.json';
import categoriesData from '@/public/mock-data/categories.json';
import postsData from '@/public/mock-data/posts.json';
import booksData from '@/public/mock-data/books.json';
import tagsData from '@/public/mock-data/tags.json';
import authorData from '@/public/mock-data/authors.json';

/**
 * Calculate reading time based on word count
 * Formula: ceiling(word_count / 200) with minimum 1 minute
 */
function calculateReadingTime(content: string): number {
  // Strip HTML tags and count words
  const text = content.replace(/<[^>]*>/g, ' ');
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const wordCount = words.length;

  // 200 words per minute, minimum 1 minute
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Find related posts based on shared tags or same category
 * Algorithm from design document
 */
function isPublishedPost(post: Post): boolean {
  return (post.status ?? 'published') === 'published';
}

function publishedTimeMs(post: Post): number {
  const t = post.publishedAt.getTime();
  return Number.isFinite(t) ? t : Number.NEGATIVE_INFINITY;
}

function findRelatedPosts(currentPost: Post, allPosts: Post[], limit: number): Post[] {
  const pool = allPosts.filter(isPublishedPost);
  // Score posts by shared tags
  const scored = pool
    .filter((post) => post.id !== currentPost.id)
    .map((post) => {
      let score = 0;

      // Count shared tags (+2 points each)
      const sharedTags = post.tags.filter((tag) =>
        currentPost.tags.some((currentTag) => currentTag.id === tag.id)
      );
      score += sharedTags.length * 2;

      // Same category (+1 point)
      if (post.categoryId === currentPost.categoryId) {
        score += 1;
      }

      return { post, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      // Sort by score descending, then by publishedAt descending
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return publishedTimeMs(b.post) - publishedTimeMs(a.post);
    });

  // If no posts with shared tags, return recent posts from same category
  if (scored.length === 0) {
    return pool
      .filter((post) => post.id !== currentPost.id && post.categoryId === currentPost.categoryId)
      .sort((a, b) => publishedTimeMs(b) - publishedTimeMs(a))
      .slice(0, limit);
  }

  return scored.slice(0, limit).map((item) => item.post);
}

/**
 * Search content across posts and books
 * Searches: post title, excerpt, category name, tags, book title, book description
 */
function searchContent(query: string, posts: Post[], books: Book[]): SearchResults {
  const normalizedQuery = query.toLowerCase().trim();

  if (normalizedQuery.length < 2) {
    return { posts: [], books: [], totalResults: 0 };
  }

  const publicPosts = posts.filter(isPublishedPost);

  // Search posts
  const matchedPosts = publicPosts.filter((post) => {
    const titleMatch = post.title.toLowerCase().includes(normalizedQuery);
    const excerptMatch = post.excerpt.toLowerCase().includes(normalizedQuery);
    const categoryMatch = post.category?.name.toLowerCase().includes(normalizedQuery);
    const tagMatch = post.tags.some((tag) => tag.name.toLowerCase().includes(normalizedQuery));

    return titleMatch || excerptMatch || categoryMatch || tagMatch;
  });

  // Search books
  const matchedBooks = books.filter((book) => {
    const titleMatch = book.title.toLowerCase().includes(normalizedQuery);
    const descMatch = book.description.toLowerCase().includes(normalizedQuery);

    return titleMatch || descMatch;
  });

  return {
    posts: matchedPosts,
    books: matchedBooks,
    totalResults: matchedPosts.length + matchedBooks.length,
  };
}

/**
 * Paginate an array of items
 */
function paginate<T>(items: T[], page: number = 1, limit: number = 20): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const validPage = Math.max(1, Math.min(page, totalPages || 1));
  const startIndex = (validPage - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    data: items.slice(startIndex, endIndex),
    pagination: {
      page: validPage,
      limit,
      total,
      totalPages: totalPages || 1,
    },
  };
}

/**
 * Mock Provider Implementation
 */
export class MockProvider implements ContentRepository {
  private fields: Field[];
  private categories: Category[];
  private posts: Post[];
  private books: Book[];
  private tags: Tag[];
  private author: Author;
  private comments: Map<string, Comment[]>;

  constructor() {
    // Transform JSON data to domain types with Date objects
    this.fields = fieldsData.map((f) => ({
      ...f,
      createdAt: new Date(f.createdAt),
      updatedAt: new Date(f.updatedAt),
    }));

    this.categories = categoriesData.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    }));

    this.tags = tagsData.map((t) => ({ ...t }));

    this.author = {
      ...authorData,
    };

    // Transform posts with relationships
    this.posts = postsData.map((p) => {
      const raw = p as { status?: string };
      const status =
        raw.status === 'draft' ? 'draft' : raw.status === 'published' ? 'published' : undefined;

      const post: Post = {
        ...p,
        status,
        publishedAt: new Date(p.publishedAt),
        updatedAt: new Date(p.updatedAt),
        category: undefined,
        author: this.author,
        tags: [],
        readingTimeMinutes: 0, // Will be calculated below
      };

      // Link category
      post.category = this.categories.find((c) => c.id === p.categoryId);

      // Link tags
      const postSource = p as { tagIds?: string[] };
      post.tags = this.tags.filter((tag) => postSource.tagIds?.includes(tag.id));

      // Calculate reading time
      post.readingTimeMinutes = calculateReadingTime(p.content);

      return post;
    });

    // Transform books
    this.books = booksData.map((b) => ({
      ...b,
      createdAt: new Date(b.createdAt),
    }));

    // Link categories to fields
    this.categories.forEach((category) => {
      category.field = this.fields.find((f) => f.id === category.fieldId);
    });

    // Initialize empty comments map (in-memory; survives for lifetime of Node process in dev)
    this.comments = new Map();

    this.syncAggregatedCounts();
  }

  private syncAggregatedCounts(): void {
    for (const c of this.categories) {
      c.postCount = this.posts.filter((p) => p.categoryId === c.id && isPublishedPost(p)).length;
    }
    for (const f of this.fields) {
      f.postCount = this.categories
        .filter((cat) => cat.fieldId === f.id)
        .reduce((sum, cat) => sum + cat.postCount, 0);
    }
    for (const t of this.tags) {
      t.postCount = this.posts.filter(
        (p) => isPublishedPost(p) && p.tags.some((tag) => tag.id === t.id)
      ).length;
    }
  }

  // Fields
  async getFields(): Promise<Field[]> {
    return [...this.fields];
  }

  async getFieldBySlug(slug: string): Promise<Field | null> {
    return this.fields.find((f) => f.slug === slug) || null;
  }

  async getFieldsWithFirstCategory(): Promise<Array<Field & { firstCategorySlug?: string }>> {
    return this.fields.map((field) => {
      const categories = this.categories
        .filter((c) => c.fieldId === field.id)
        .sort((a, b) => a.order - b.order);
      return {
        ...field,
        firstCategorySlug: categories[0]?.slug,
      };
    });
  }

  // Categories
  async getCategoriesByFieldId(fieldId: string): Promise<Category[]> {
    return this.categories.filter((c) => c.fieldId === fieldId).sort((a, b) => a.order - b.order);
  }

  async getCategoryBySlug(fieldSlug: string, categorySlug: string): Promise<Category | null> {
    return (
      this.categories.find((c) => c.slug === categorySlug && c.field?.slug === fieldSlug) || null
    );
  }

  // Posts
  async getPosts(options?: PostQueryOptions): Promise<PaginatedResult<Post>> {
    const { page = 1, limit = 20, sortBy = 'publishedAt', sortOrder = 'desc' } = options || {};

    // Sort posts
    const sorted = [...this.posts].filter(isPublishedPost).sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'publishedAt':
          comparison = a.publishedAt.getTime() - b.publishedAt.getTime();
          break;
        case 'viewCount':
          comparison = a.viewCount - b.viewCount;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return paginate(sorted, page, limit);
  }

  async getPostBySlug(
    fieldSlug: string,
    categorySlug: string,
    postSlug: string
  ): Promise<Post | null> {
    const post = this.posts.find(
      (p) =>
        p.slug === postSlug &&
        p.category?.slug === categorySlug &&
        p.category?.field?.slug === fieldSlug
    );
    if (!post || !isPublishedPost(post)) return null;
    return post;
  }

  async getPostsByCategory(
    categoryId: string,
    options?: PostQueryOptions
  ): Promise<PaginatedResult<Post>> {
    const { page = 1, limit = 20, sortBy = 'publishedAt', sortOrder = 'desc' } = options || {};

    const filtered = this.posts.filter((p) => p.categoryId === categoryId && isPublishedPost(p));

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'publishedAt':
          comparison = a.publishedAt.getTime() - b.publishedAt.getTime();
          break;
        case 'viewCount':
          comparison = a.viewCount - b.viewCount;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return paginate(sorted, page, limit);
  }

  async getPostsByTag(tagSlug: string, options?: PostQueryOptions): Promise<PaginatedResult<Post>> {
    const { page = 1, limit = 20, sortBy = 'publishedAt', sortOrder = 'desc' } = options || {};

    const filtered = this.posts.filter(
      (post) => isPublishedPost(post) && post.tags.some((tag) => tag.slug === tagSlug)
    );

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'publishedAt':
          comparison = a.publishedAt.getTime() - b.publishedAt.getTime();
          break;
        case 'viewCount':
          comparison = a.viewCount - b.viewCount;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return paginate(sorted, page, limit);
  }

  async getRelatedPosts(postId: string, limit: number): Promise<Post[]> {
    const currentPost = this.posts.find((p) => p.id === postId);
    if (!currentPost || !isPublishedPost(currentPost)) return [];

    return findRelatedPosts(currentPost, this.posts, limit);
  }

  async getRecentPosts(limit: number): Promise<Post[]> {
    return [...this.posts]
      .filter(isPublishedPost)
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  async incrementViewCount(postId: string): Promise<void> {
    // Update in-memory post count (works both server and client side)
    const post = this.posts.find((p) => p.id === postId);
    if (post) {
      post.viewCount = (post.viewCount ?? 0) + 1;
    }
    // Persist to localStorage when running client-side
    if (typeof window !== 'undefined') {
      const key = `post-views-${postId}`;
      localStorage.setItem(key, String(post?.viewCount ?? 1));
    }
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    return [...this.tags];
  }

  async getTagBySlug(slug: string): Promise<Tag | null> {
    return this.tags.find((t) => t.slug === slug) || null;
  }

  // Books
  async getBooks(options?: BookQueryOptions): Promise<PaginatedResult<Book>> {
    const { page = 1, limit = 12, series } = options || {};

    let filtered = [...this.books];

    // Filter by series if specified
    if (series) {
      filtered = filtered.filter((b) => b.series === series);
    }

    return paginate(filtered, page, limit);
  }

  async getFeaturedBooks(limit: number): Promise<Book[]> {
    // Return first N books as featured
    return this.books.slice(0, limit);
  }

  async getBookBySlug(slug: string): Promise<Book | null> {
    return this.books.find((b) => b.slug === slug) || null;
  }

  // Comments
  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    return this.comments.get(postId) || [];
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    const comment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      postId: input.postId,
      userId: input.userId ?? '',
      userName: input.userName,
      userAvatar: input.userAvatar,
      content: input.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to comments map
    const postComments = this.comments.get(input.postId) || [];
    postComments.push(comment);
    this.comments.set(input.postId, postComments);

    return comment;
  }

  // Search
  async search(query: string): Promise<SearchResults> {
    return searchContent(query, this.posts, this.books);
  }

  // Author
  async getAuthor(): Promise<Author> {
    return { ...this.author };
  }

  async updateAuthor(input: UpdateAuthorInput): Promise<Author> {
    // Update author in memory
    this.author = {
      ...this.author,
      name: input.name,
      email: input.email,
      bio: input.bio,
      avatarUrl: input.avatarUrl,
      expertise: input.expertise,
      certifications: input.certifications,
      socialLinks: input.socialLinks,
    };

    // In a real implementation, this would persist to storage
    // For mock provider, we just update in-memory data
    return { ...this.author };
  }

  // Navigation
  async getNavigationTree(): Promise<NavigationNode[]> {
    return this.fields.map((field) => {
      const fieldCategories = this.categories.filter((c) => c.fieldId === field.id);

      return {
        id: field.id,
        type: 'field' as const,
        label: field.name,
        slug: field.slug,
        url: `/fields/${field.slug}`,
        postCount: fieldCategories.length, // Số lượng danh mục, không phải số bài viết
        children: fieldCategories.map((category) => {
          const categoryPosts = this.posts.filter(
            (p) => p.categoryId === category.id && isPublishedPost(p)
          );

          return {
            id: category.id,
            type: 'category' as const,
            label: category.name,
            slug: category.slug,
            url: `/fields/${field.slug}/${category.slug}`,
            postCount: category.postCount, // Số bài viết trong danh mục
            children: categoryPosts.map((post) => ({
              id: post.id,
              type: 'post' as const,
              label: post.title,
              slug: post.slug,
              url: `/fields/${field.slug}/${category.slug}/${post.slug}`,
            })),
          };
        }),
      };
    });
  }

  async listPostsForAdmin(options?: AdminPostListOptions): Promise<PaginatedResult<Post>> {
    const { status = 'all', page = 1, limit = 50 } = options || {};
    let list = [...this.posts];
    if (status === 'draft') {
      list = list.filter((p) => (p.status ?? 'published') === 'draft');
    } else if (status === 'published') {
      list = list.filter(isPublishedPost);
    }
    list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return paginate(list, page, limit);
  }

  async getPostById(id: string): Promise<Post | null> {
    return this.posts.find((p) => p.id === id) || null;
  }

  async createPost(input: CreatePostInput): Promise<Post> {
    const slug = input.slug.trim();
    const category = this.categories.find((c) => c.id === input.categoryId);
    if (!category) {
      throw new Error('INVALID_CATEGORY');
    }
    const dup = this.posts.some((p) => p.categoryId === input.categoryId && p.slug === slug);
    if (dup) throw new Error('SLUG_TAKEN');

    const id = `post-${Date.now()}`;
    const now = new Date();
    const post: Post = {
      id,
      slug,
      title: input.title.trim(),
      excerpt: input.excerpt.trim(),
      content: input.content,
      thumbnailUrl: input.thumbnailUrl?.trim() || undefined,
      categoryId: category.id,
      category,
      authorId: this.author.id,
      author: this.author,
      tags: this.tags.filter((t) => input.tagIds.includes(t.id)),
      status: input.status,
      publishedAt: now,
      updatedAt: now,
      viewCount: 0,
      readingTimeMinutes: calculateReadingTime(input.content),
      seo: input.seo,
    };
    this.posts.push(post);
    this.syncAggregatedCounts();
    return post;
  }

  async updatePost(id: string, input: UpdatePostInput): Promise<Post | null> {
    const post = this.posts.find((p) => p.id === id);
    if (!post) return null;

    const nextCategoryId = input.categoryId ?? post.categoryId;
    const nextSlug = (input.slug ?? post.slug).trim();

    if (nextSlug !== post.slug || nextCategoryId !== post.categoryId) {
      const dup = this.posts.some(
        (p) => p.id !== id && p.categoryId === nextCategoryId && p.slug === nextSlug
      );
      if (dup) throw new Error('SLUG_TAKEN');
    }

    const category = this.categories.find((c) => c.id === nextCategoryId);
    if (!category) throw new Error('INVALID_CATEGORY');

    if (typeof input.title === 'string') post.title = input.title.trim();
    if (typeof input.excerpt === 'string') post.excerpt = input.excerpt.trim();
    if (typeof input.content === 'string') {
      post.content = input.content;
      post.readingTimeMinutes = calculateReadingTime(input.content);
    }
    if (input.slug !== undefined) post.slug = nextSlug;
    if (input.categoryId !== undefined) {
      post.categoryId = category.id;
      post.category = category;
    }
    if (input.tagIds) {
      post.tags = this.tags.filter((t) => input.tagIds!.includes(t.id));
    }
    if (input.thumbnailUrl !== undefined) {
      post.thumbnailUrl =
        input.thumbnailUrl === null || input.thumbnailUrl === '' ? undefined : input.thumbnailUrl;
    }
    if (input.status !== undefined) post.status = input.status;
    if (input.seo) {
      post.seo = {
        title: input.seo.title ?? post.seo.title,
        description: input.seo.description ?? post.seo.description,
        ogImage: input.seo.ogImage ?? post.seo.ogImage,
        keywords: input.seo.keywords ?? post.seo.keywords,
      };
    }
    post.updatedAt = new Date();
    this.syncAggregatedCounts();
    return post;
  }

  async deletePost(id: string): Promise<boolean> {
    const idx = this.posts.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.posts.splice(idx, 1);
    this.syncAggregatedCounts();
    return true;
  }
}
