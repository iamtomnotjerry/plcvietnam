/**
 * Supabase Data Provider
 * Implements ContentRepository using Supabase as the backend.
 *
 * Uses anon client for public reads (no auth needed).
 * Uses service-role client for admin writes (bypasses RLS safely on server).
 */

import type { Database } from '@/lib/supabase/database.types';
import type {
  ContentRepository,
  PostQueryOptions,
  BookQueryOptions,
  PaginatedResult,
  SearchResults,
  CreateCommentInput,
  UpdateAuthorInput,
  AdminPostListOptions,
  CreatePostInput,
  UpdatePostInput,
} from '@/lib/data/repository';
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

// ── Type-Safe Database Relations ─────────────────────────────────────────────
type DbTag = Database['public']['Tables']['tags']['Row'];
type DbCategory = Database['public']['Tables']['categories']['Row'];
type DbField = Database['public']['Tables']['fields']['Row'];
type DbProfile = Database['public']['Tables']['profiles']['Row'];

type PostTagRelation = {
  tag_id: string;
  tags: DbTag;
};

type PostWithTags = Database['public']['Tables']['posts']['Row'] & {
  post_tags: PostTagRelation[];
};

type PostWithRelations = PostWithTags & {
  categories: DbCategory & {
    fields: DbField;
  };
};

type PostWithAuthor = PostWithTags & {
  profiles: DbProfile | null;
};

type PostTagJoinRow = {
  posts: PostWithRelations;
};
type FieldWithCategories = DbField & {
  categories?: Array<{ id: string }> | { id: string } | null;
};
type FieldWithCategorySlugs = DbField & {
  categories?: Array<{ slug: string }> | { slug: string } | null;
};
type FieldWithNavigationCategories = DbField & {
  categories?: DbCategory[] | DbCategory | null;
};

// ── Clients — use singletons to reuse connection pools ────────────────────────
import {
  getAnonClient as _getAnonClient,
  getServiceClient as _getServiceClient,
} from '@/lib/supabase/client-singleton';

function getAnonClient() {
  return _getAnonClient();
}

function getServiceClient() {
  return _getServiceClient();
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapField(row: Database['public']['Tables']['fields']['Row']): Field {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    icon: row.icon ?? undefined,
    postCount: row.post_count ?? 0,
    createdAt: new Date(row.created_at ?? Date.now()),
    updatedAt: new Date(row.updated_at ?? Date.now()),
  };
}

function mapCategory(
  row: Database['public']['Tables']['categories']['Row'],
  field?: Field
): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    fieldId: row.field_id ?? '',
    field,
    postCount: row.post_count ?? 0,
    order: 0,
    createdAt: new Date(row.created_at ?? Date.now()),
    updatedAt: new Date(row.updated_at ?? Date.now()),
  };
}

function mapTag(row: Database['public']['Tables']['tags']['Row']): Tag {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    postCount: row.post_count ?? 0,
  };
}

function mapPost(
  row: Database['public']['Tables']['posts']['Row'],
  tags: Tag[] = [],
  category?: Category
): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? '',
    content: row.content,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    categoryId: row.category_id ?? '',
    category,
    authorId: row.author_id ?? '',
    tags,
    status: (row.status as 'draft' | 'published') ?? 'published',
    publishedAt: new Date(row.published_at ?? row.created_at ?? Date.now()),
    updatedAt: new Date(row.updated_at ?? Date.now()),
    viewCount: row.view_count ?? 0,
    readingTimeMinutes: row.reading_time ?? estimateReadingTime(row.content),
    seo: {
      title: row.seo_title ?? row.title,
      description: row.seo_description ?? row.excerpt ?? '',
      keywords: row.seo_keywords ?? [],
    },
  };
}

function mapComment(row: Database['public']['Tables']['comments']['Row']): Comment {
  return {
    id: row.id,
    postId: row.post_id ?? '',
    parentId: row.parent_id ?? null,
    userId: row.user_id ?? '',
    userName: row.author_name,
    userAvatar: row.author_avatar ?? undefined,
    content: row.content,
    createdAt: new Date(row.created_at ?? Date.now()),
    updatedAt: new Date(row.updated_at ?? Date.now()),
  };
}

function mapAuthor(row: Database['public']['Tables']['author_info']['Row']): Author {
  const social = (row.social_links as Record<string, string> | null) ?? {};
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? '',
    bio: row.bio ?? '',
    avatarUrl: row.avatar_url ?? undefined,
    expertise: [],
    certifications: [],
    socialLinks: {
      email: social['email'],
      linkedin: social['linkedin'],
      github: social['github'],
      twitter: social['twitter'],
    },
  };
}

function mapProfile(row: Database['public']['Tables']['profiles']['Row']): Author {
  return {
    id: row.id,
    name: row.full_name ?? row.email.split('@')[0],
    email: row.email,
    bio: row.bio ?? '',
    avatarUrl: row.avatar_url ?? undefined,
    expertise: [],
    certifications: [],
    socialLinks: {},
  };
}

type BookRow = Database['public']['Tables']['books']['Row'];

function mapBook(row: BookRow): Book {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? '',
    coverImageUrl: row.cover_image_url ?? '',
    authorName: row.author_name ?? '',
    series: row.series ?? undefined,
    volume: row.volume ?? undefined,
    publisher: row.publisher ?? undefined,
    publishedYear: row.published_year ?? undefined,
    pages: row.pages ?? undefined,
    isbn: row.isbn ?? undefined,
    downloadUrl: row.download_url ?? undefined,
    externalUrl: row.amazon_url ?? undefined,
    featured: row.featured ?? false,
    createdAt: new Date(row.created_at ?? Date.now()),
  };
}

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class SupabaseProvider implements ContentRepository {
  // Public reads use anon client (respects RLS)
  private get db() {
    return getAnonClient();
  }
  // Admin writes use service client (bypasses RLS, server-side only)
  private get admin() {
    return getServiceClient();
  }

  // ── Fields ────────────────────────────────────────────────────────────────

  async getFields(): Promise<Field[]> {
    const { data, error } = await this.db
      .from('fields')
      .select('*, categories(id)')
      .order('order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => {
      const typedRow = row as unknown as FieldWithCategories;
      const cats = Array.isArray(typedRow.categories) ? typedRow.categories : [];
      const field = mapField(row);
      return {
        ...field,
        postCount: cats.length, // Số lượng danh mục
      };
    });
  }

  async getFieldBySlug(slug: string): Promise<Field | null> {
    const { data } = await this.db.from('fields').select('*').eq('slug', slug).single();
    return data ? mapField(data) : null;
  }

  /**
   * Get all fields with their first category slug (optimized - single query)
   * Fixes N+1 query issue in homepage
   */
  async getFieldsWithFirstCategory(): Promise<Array<Field & { firstCategorySlug?: string }>> {
    const { data, error } = await this.db
      .from('fields')
      .select('*, categories(slug, name)')
      .order('order', { ascending: true })
      .order('name', { ascending: true })
      .order('order', { ascending: true, foreignTable: 'categories' })
      .order('name', { ascending: true, foreignTable: 'categories' });

    if (error) throw error;

    // Group categories by field and get first category slug
    const fieldsMap = new Map<string, Field & { firstCategorySlug?: string }>();

    (data ?? []).forEach((row) => {
      const typedRow = row as unknown as FieldWithCategorySlugs;
      const fieldId = row.id;
      if (!fieldsMap.has(fieldId)) {
        const cats: Array<{ slug: string }> = Array.isArray(typedRow.categories)
          ? typedRow.categories
          : typedRow.categories
            ? [typedRow.categories]
            : [];

        // Map field with category count as postCount
        const field = mapField(row);
        fieldsMap.set(fieldId, {
          ...field,
          postCount: cats.length, // Số lượng danh mục
          firstCategorySlug: cats[0]?.slug,
        });
      }
    });

    return Array.from(fieldsMap.values());
  }

  // ── Categories ────────────────────────────────────────────────────────────

  async getCategoriesByFieldId(fieldId: string): Promise<Category[]> {
    const { data, error } = await this.db
      .from('categories')
      .select('*')
      .eq('field_id', fieldId)
      .order('order', { ascending: true })
      .order('name', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => mapCategory(row));
  }

  async getCategoryBySlug(fieldSlug: string, categorySlug: string): Promise<Category | null> {
    const field = await this.getFieldBySlug(fieldSlug);
    if (!field) return null;
    const { data } = await this.db
      .from('categories')
      .select('*')
      .eq('slug', categorySlug)
      .eq('field_id', field.id)
      .single();
    return data ? mapCategory(data, field) : null;
  }

  // ── Posts ─────────────────────────────────────────────────────────────────

  async getPosts(options: PostQueryOptions = {}): Promise<PaginatedResult<Post>> {
    const { page = 1, limit = 20, sortBy = 'publishedAt', sortOrder = 'desc' } = options;
    const colMap: Record<string, string> = {
      publishedAt: 'published_at',
      viewCount: 'view_count',
      title: 'title',
    };

    const { data, error, count } = await this.db
      .from('posts')
      .select('*, categories(*, fields(*)), post_tags(tag_id, tags(*))', { count: 'exact' })
      .eq('status', 'published')
      .order(colMap[sortBy] ?? 'published_at', { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    type PostWithRelations = Database['public']['Tables']['posts']['Row'] & {
      categories: Database['public']['Tables']['categories']['Row'] & {
        fields: Database['public']['Tables']['fields']['Row'];
      };
      post_tags: Array<{
        tag_id: string;
        tags: Database['public']['Tables']['tags']['Row'];
      }>;
    };

    const posts = (data ?? []).map((row) => {
      const postRow = row as unknown as PostWithRelations;
      const tags = (postRow.post_tags ?? []).map((pt) => mapTag(pt.tags)).filter(Boolean);
      const catRow = postRow.categories;
      const field = catRow?.fields ? mapField(catRow.fields) : undefined;
      const category = catRow ? mapCategory(catRow, field) : undefined;
      return mapPost(postRow, tags, category);
    });

    return {
      data: posts,
      pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
    };
  }

  async getPostBySlug(
    fieldSlug: string,
    categorySlug: string,
    postSlug: string
  ): Promise<Post | null> {
    const category = await this.getCategoryBySlug(fieldSlug, categorySlug);
    if (!category) return null;

    const { data } = await this.db
      .from('posts')
      .select('*, profiles(id, full_name, email, bio, avatar_url), post_tags(tag_id, tags(*))')
      .eq('slug', postSlug)
      .eq('category_id', category.id)
      .eq('status', 'published')
      .single();

    if (!data) return null;
    const typedData = data as unknown as PostWithAuthor;
    const tags = (typedData.post_tags ?? []).map((pt) => mapTag(pt.tags)).filter(Boolean);
    const author = typedData.profiles ? mapProfile(typedData.profiles) : undefined;
    return { ...mapPost(data, tags, category), author };
  }

  async getPostsByCategory(
    categoryId: string,
    options: PostQueryOptions = {}
  ): Promise<PaginatedResult<Post>> {
    const { page = 1, limit = 20 } = options;
    const { data, error, count } = await this.db
      .from('posts')
      .select('*, categories(*, fields(*)), post_tags(tag_id, tags(*))', { count: 'exact' })
      .eq('category_id', categoryId)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    const posts = (data ?? []).map((row) => {
      const typedRow = row as unknown as PostWithRelations;
      const tags = (typedRow.post_tags ?? []).map((pt) => mapTag(pt.tags)).filter(Boolean);
      const field = typedRow.categories?.fields ? mapField(typedRow.categories.fields) : undefined;
      const category = typedRow.categories ? mapCategory(typedRow.categories, field) : undefined;
      return mapPost(row, tags, category);
    });
    return {
      data: posts,
      pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
    };
  }

  async getPostsByTag(
    tagSlug: string,
    options: PostQueryOptions = {}
  ): Promise<PaginatedResult<Post>> {
    const { page = 1, limit = 20 } = options;
    const tag = await this.getTagBySlug(tagSlug);
    if (!tag) return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };

    const { data, error, count } = await this.db
      .from('post_tags')
      .select('posts!inner(*, categories(*, fields(*)), post_tags(tag_id, tags(*)))', {
        count: 'exact',
      })
      .eq('tag_id', tag.id)
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    const posts = (data ?? []).map((row) => {
      const typedRow = row as unknown as PostTagJoinRow;
      const postRow = typedRow.posts;
      const tags = (postRow.post_tags ?? []).map((pt) => mapTag(pt.tags)).filter(Boolean);
      const field = postRow.categories?.fields ? mapField(postRow.categories.fields) : undefined;
      const category = postRow.categories ? mapCategory(postRow.categories, field) : undefined;
      return mapPost(postRow, tags, category);
    });
    return {
      data: posts,
      pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
    };
  }

  async getRelatedPosts(postId: string, limit: number): Promise<Post[]> {
    const { data: postData } = await this.db
      .from('posts')
      .select('category_id')
      .eq('id', postId)
      .single();
    if (!postData) return [];

    const { data } = await this.db
      .from('posts')
      .select('*, categories(*, fields(*)), post_tags(tag_id, tags(*))')
      .eq('status', 'published')
      .eq('category_id', postData.category_id ?? '')
      .neq('id', postId)
      .order('published_at', { ascending: false })
      .limit(limit);

    return (data ?? []).map((row) => {
      const typedRow = row as unknown as PostWithRelations;
      const tags = (typedRow.post_tags ?? []).map((pt) => mapTag(pt.tags)).filter(Boolean);
      const field = typedRow.categories?.fields ? mapField(typedRow.categories.fields) : undefined;
      const category = typedRow.categories ? mapCategory(typedRow.categories, field) : undefined;
      return mapPost(row, tags, category);
    });
  }

  async getRecentPosts(limit: number): Promise<Post[]> {
    const { data } = await this.db
      .from('posts')
      .select('*, categories(*, fields(*)), post_tags(tag_id, tags(*))')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    return (data ?? []).map((row) => {
      const typedRow = row as unknown as PostWithRelations;
      const tags = (typedRow.post_tags ?? []).map((pt) => mapTag(pt.tags)).filter(Boolean);
      const field = typedRow.categories?.fields ? mapField(typedRow.categories.fields) : undefined;
      const category = typedRow.categories ? mapCategory(typedRow.categories, field) : undefined;
      return mapPost(row, tags, category);
    });
  }

  async incrementViewCount(postId: string): Promise<void> {
    await this.db.rpc('increment_post_view', { post_id: postId });
  }

  // ── Admin Posts ───────────────────────────────────────────────────────────

  async listPostsForAdmin(options: AdminPostListOptions = {}): Promise<PaginatedResult<Post>> {
    const { page = 1, limit = 20, status } = options;

    let query = this.admin
      .from('posts')
      .select('*, categories(*, fields(*)), post_tags(tag_id, tags(*))', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw error;

    const posts = (data ?? []).map((row) => {
      const typedRow = row as unknown as PostWithRelations;
      const tags = (typedRow.post_tags ?? []).map((pt) => mapTag(pt.tags)).filter(Boolean);
      const field = typedRow.categories?.fields ? mapField(typedRow.categories.fields) : undefined;
      const category = typedRow.categories ? mapCategory(typedRow.categories, field) : undefined;
      return mapPost(row, tags, category);
    });
    return {
      data: posts,
      pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
    };
  }

  async getPostById(id: string): Promise<Post | null> {
    const { data } = await this.admin
      .from('posts')
      .select('*, categories(*, fields(*)), post_tags(tag_id, tags(*))')
      .eq('id', id)
      .single();
    if (!data) return null;
    const typedData = data as unknown as PostWithRelations;
    const tags = (typedData.post_tags ?? []).map((pt) => mapTag(pt.tags)).filter(Boolean);
    const field = typedData.categories?.fields ? mapField(typedData.categories.fields) : undefined;
    const category = typedData.categories ? mapCategory(typedData.categories, field) : undefined;
    return mapPost(data, tags, category);
  }

  async createPost(input: CreatePostInput): Promise<Post> {
    const { data, error } = await this.admin
      .from('posts')
      .insert({
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        category_id: input.categoryId,
        thumbnail_url: input.thumbnailUrl ?? null,
        status: input.status,
        seo_title: input.seo.title,
        seo_description: input.seo.description,
        seo_keywords: input.seo.keywords,
        reading_time: estimateReadingTime(input.content),
        published_at: input.status === 'published' ? new Date().toISOString() : null,
      })
      .select('*, categories(*, fields(*))')
      .single();

    if (error) throw error;

    if (input.tagIds.length > 0) {
      const { error: tagInsertError } = await this.admin
        .from('post_tags')
        .insert(input.tagIds.map((tag_id) => ({ post_id: data.id, tag_id })));
      if (tagInsertError) {
        await this.admin.from('posts').delete().eq('id', data.id);
        throw tagInsertError;
      }
    }

    const typedData = data as unknown as PostWithRelations;
    const field = typedData.categories?.fields ? mapField(typedData.categories.fields) : undefined;
    const category = typedData.categories ? mapCategory(typedData.categories, field) : undefined;
    return mapPost(data, [], category);
  }

  async updatePost(id: string, input: UpdatePostInput): Promise<Post | null> {
    type PostUpdate = Database['public']['Tables']['posts']['Update'];
    const updateData: PostUpdate = {};
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.title !== undefined) updateData.title = input.title;
    if (input.excerpt !== undefined) updateData.excerpt = input.excerpt;
    if (input.content !== undefined) {
      updateData.content = input.content;
      updateData.reading_time = estimateReadingTime(input.content);
    }
    if (input.categoryId !== undefined) updateData.category_id = input.categoryId;
    if (input.thumbnailUrl !== undefined) updateData.thumbnail_url = input.thumbnailUrl;
    if (input.status !== undefined) {
      updateData.status = input.status;
      if (input.status === 'published') updateData.published_at = new Date().toISOString();
    }
    if (input.seo) {
      if (input.seo.title) updateData.seo_title = input.seo.title;
      if (input.seo.description) updateData.seo_description = input.seo.description;
      if (input.seo.keywords) updateData.seo_keywords = input.seo.keywords;
    }

    const { data, error } = await this.admin
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select('*, categories(*, fields(*))')
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    if (input.tagIds !== undefined) {
      const { error: delErr } = await this.admin.from('post_tags').delete().eq('post_id', id);
      if (delErr) throw delErr;
      if (input.tagIds.length > 0) {
        const { error: insErr } = await this.admin
          .from('post_tags')
          .insert(input.tagIds.map((tag_id) => ({ post_id: id, tag_id })));
        if (insErr) throw insErr;
      }
    }

    const typedData = data as unknown as PostWithRelations;
    const field = typedData.categories?.fields ? mapField(typedData.categories.fields) : undefined;
    const category = typedData.categories ? mapCategory(typedData.categories, field) : undefined;
    return mapPost(data, [], category);
  }

  async deletePost(id: string): Promise<boolean> {
    const { error } = await this.admin.from('posts').delete().eq('id', id);
    return !error;
  }

  // ── Tags ──────────────────────────────────────────────────────────────────

  async getTags(): Promise<Tag[]> {
    const { data, error } = await this.db.from('tags').select('*').order('name');
    if (error) throw error;
    return (data ?? []).map(mapTag);
  }

  async getTagBySlug(slug: string): Promise<Tag | null> {
    const { data } = await this.db.from('tags').select('*').eq('slug', slug).single();
    return data ? mapTag(data) : null;
  }

  // ── Books ─────────────────────────────────────────────────────────────────

  async getBooks(options: BookQueryOptions = {}): Promise<PaginatedResult<Book>> {
    const { page = 1, limit = 20 } = options;
    const { data, error, count } = await this.db
      .from('books')
      .select('*', { count: 'exact' })
      .order('title', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return {
      data: (data ?? []).map(mapBook),
      pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
    };
  }

  async getFeaturedBooks(limit: number): Promise<Book[]> {
    const { data, error } = await this.db
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get featured books:', error);
      return [];
    }

    return (data ?? []).map(mapBook);
  }

  async getBookBySlug(slug: string): Promise<Book | null> {
    const { data } = await this.db.from('books').select('*').eq('slug', slug).single();
    return data ? mapBook(data) : null;
  }

  // ── Comments ──────────────────────────────────────────────────────────────

  async getCommentsByPostId(postId: string): Promise<Comment[]> {
    const { data } = await this.db
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });

    const flat = (data ?? []).map(mapComment);

    // Build nested tree: top-level comments with replies array
    const map = new Map<string, Comment>();
    const roots: Comment[] = [];

    flat.forEach((c) => {
      map.set(c.id, { ...c, replies: [] });
    });

    map.forEach((c) => {
      if (c.parentId) {
        const parent = map.get(c.parentId);
        if (parent) {
          parent.replies = parent.replies ?? [];
          parent.replies.push(c);
          return;
        }
      }
      roots.push(c);
    });

    return roots;
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    // Use service client so RLS doesn't block the insert and auto-approve works
    const { data, error } = await this.admin
      .from('comments')
      .insert({
        post_id: input.postId,
        parent_id: input.parentId ?? null,
        user_id: input.userId ?? null,
        author_name: input.userName,
        author_email: input.userEmail ?? '',
        author_avatar: input.userAvatar ?? null,
        content: input.content,
        is_approved: true, // Auto-approve authenticated users
      })
      .select()
      .single();

    if (error) throw error;
    return mapComment(data);
  }

  // ── Search ────────────────────────────────────────────────────────────────

  async search(query: string): Promise<SearchResults> {
    const q = `%${query}%`;

    const [postsResult, booksResult] = await Promise.all([
      this.db.rpc('search_posts', { query, result_limit: 10 }),
      this.db.from('books').select('*').or(`title.ilike.${q},description.ilike.${q}`).limit(5),
    ]);

    const posts = (postsResult.data ?? []).map((row) =>
      mapPost(row as Database['public']['Tables']['posts']['Row'], [])
    );
    const books = (booksResult.data ?? []).map(mapBook);

    return { posts, books, totalResults: posts.length + books.length };
  }

  // ── Author ────────────────────────────────────────────────────────────────

  async getAuthor(): Promise<Author> {
    const { data } = await this.db.from('author_info').select('*').limit(1).single();
    if (!data) {
      return {
        id: '',
        name: 'PLC Vietnam',
        email: '',
        bio: '',
        avatarUrl: undefined,
        expertise: [],
        certifications: [],
        socialLinks: {},
      };
    }
    return mapAuthor(data);
  }

  async updateAuthor(input: UpdateAuthorInput): Promise<Author> {
    const { data: existing } = await this.admin.from('author_info').select('id').limit(1).single();
    const payload = {
      name: input.name,
      email: input.email,
      bio: input.bio,
      avatar_url: input.avatarUrl ?? null,
      social_links: input.socialLinks,
    };

    if (existing) {
      const { data, error } = await this.admin
        .from('author_info')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return mapAuthor(data);
    } else {
      const { data, error } = await this.admin
        .from('author_info')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return mapAuthor(data);
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async getNavigationTree(): Promise<NavigationNode[]> {
    // Single query: fields with their categories
    const { data: fields, error } = await this.db
      .from('fields')
      .select('*, categories(*)')
      .order('order', { ascending: true })
      .order('name', { ascending: true })
      .order('order', { ascending: true, foreignTable: 'categories' })
      .order('name', { ascending: true, foreignTable: 'categories' });

    if (error) throw error;

    return (fields ?? []).map((field) => {
      const typedField = field as unknown as FieldWithNavigationCategories;
      const categories = Array.isArray(typedField.categories)
        ? typedField.categories
        : typedField.categories
          ? [typedField.categories]
          : [];
      return {
        id: field.id,
        type: 'field' as const,
        label: field.name,
        slug: field.slug,
        url: `/fields/${field.slug}`,
        postCount: categories.length, // Số lượng danh mục, không phải số bài viết
        children: categories.map((cat) => ({
          id: cat.id,
          type: 'category' as const,
          label: cat.name,
          slug: cat.slug,
          url: `/fields/${field.slug}/${cat.slug}`,
          postCount: cat.post_count ?? 0, // Số bài viết trong danh mục
        })),
      };
    });
  }
}
