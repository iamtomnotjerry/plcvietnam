/**
 * Supabase Data Provider
 * Implements ContentRepository using Supabase as the backend.
 *
 * Uses anon client for public reads (no auth needed).
 * Uses service-role client for admin writes (bypasses RLS safely on server).
 */

import { createClient } from '@supabase/supabase-js';
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

// ── Clients ───────────────────────────────────────────────────────────────────

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient<Database>(url, key, { auth: { persistSession: false } });
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Service role key bypasses RLS - only use server-side
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient<Database>(url, key, { auth: { persistSession: false } });
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

function mapBook(row: Database['public']['Tables']['books']['Row']): Book {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? '',
    coverImageUrl: row.cover_url ?? '',
    authorName: row.author ?? '',
    downloadUrl: row.download_url ?? undefined,
    externalUrl: row.amazon_url ?? undefined,
    publishedYear: row.published_year ?? undefined,
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
    const { data, error } = await this.db.from('fields').select('*').order('name');
    if (error) throw error;
    return (data ?? []).map(mapField);
  }

  async getFieldBySlug(slug: string): Promise<Field | null> {
    const { data } = await this.db.from('fields').select('*').eq('slug', slug).single();
    return data ? mapField(data) : null;
  }

  // ── Categories ────────────────────────────────────────────────────────────

  async getCategoriesByFieldId(fieldId: string): Promise<Category[]> {
    const { data, error } = await this.db
      .from('categories')
      .select('*')
      .eq('field_id', fieldId)
      .order('name');
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

    const posts = (data ?? []).map((row) => {
      const tags = (row.post_tags ?? []).map((pt: any) => mapTag(pt.tags)).filter(Boolean);
      const catRow = row.categories as any;
      const field = catRow?.fields ? mapField(catRow.fields) : undefined;
      const category = catRow ? mapCategory(catRow, field) : undefined;
      return mapPost(row, tags, category);
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
      .select('*, post_tags(tag_id, tags(*))')
      .eq('slug', postSlug)
      .eq('category_id', category.id)
      .eq('status', 'published')
      .single();

    if (!data) return null;
    const tags = (data.post_tags ?? []).map((pt: any) => mapTag(pt.tags)).filter(Boolean);
    return mapPost(data, tags, category);
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
      const tags = (row.post_tags ?? []).map((pt: any) => mapTag(pt.tags)).filter(Boolean);
      const catRow = (row as any).categories;
      const field = catRow?.fields ? mapField(catRow.fields) : undefined;
      const category = catRow ? mapCategory(catRow, field) : undefined;
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
    const posts = (data ?? []).map((row: any) => {
      const postRow = row.posts;
      const tags = (postRow.post_tags ?? []).map((pt: any) => mapTag(pt.tags)).filter(Boolean);
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
      const tags = (row.post_tags ?? []).map((pt: any) => mapTag(pt.tags)).filter(Boolean);
      const catRow = (row as any).categories;
      const field = catRow?.fields ? mapField(catRow.fields) : undefined;
      const category = catRow ? mapCategory(catRow, field) : undefined;
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
      const tags = (row.post_tags ?? []).map((pt: any) => mapTag(pt.tags)).filter(Boolean);
      const catRow = (row as any).categories;
      const field = catRow?.fields ? mapField(catRow.fields) : undefined;
      const category = catRow ? mapCategory(catRow, field) : undefined;
      return mapPost(row, tags, category);
    });
  }

  async incrementViewCount(postId: string): Promise<void> {
    await this.db.rpc('increment_post_view' as any, { post_id: postId });
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
      const tags = (row.post_tags ?? []).map((pt: any) => mapTag(pt.tags)).filter(Boolean);
      const catRow = (row as any).categories;
      const field = catRow?.fields ? mapField(catRow.fields) : undefined;
      const category = catRow ? mapCategory(catRow, field) : undefined;
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
    const tags = (data.post_tags ?? []).map((pt: any) => mapTag(pt.tags)).filter(Boolean);
    const catRow = (data as any).categories;
    const field = catRow?.fields ? mapField(catRow.fields) : undefined;
    const category = catRow ? mapCategory(catRow, field) : undefined;
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
      .select()
      .single();

    if (error) throw error;

    if (input.tagIds.length > 0) {
      await this.admin
        .from('post_tags')
        .insert(input.tagIds.map((tag_id) => ({ post_id: data.id, tag_id })));
    }

    return mapPost(data, []);
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
      .select()
      .single();
    if (error) return null;

    if (input.tagIds !== undefined) {
      await this.admin.from('post_tags').delete().eq('post_id', id);
      if (input.tagIds.length > 0) {
        await this.admin
          .from('post_tags')
          .insert(input.tagIds.map((tag_id) => ({ post_id: id, tag_id })));
      }
    }

    return mapPost(data, []);
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
      .order('title')
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return {
      data: (data ?? []).map(mapBook),
      pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
    };
  }

  async getFeaturedBooks(limit: number): Promise<Book[]> {
    const { data } = await this.db
      .from('books')
      .select('*')
      .order('download_count', { ascending: false })
      .limit(limit);
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
    return (data ?? []).map(mapComment);
  }

  async createComment(input: CreateCommentInput): Promise<Comment> {
    const { data, error } = await this.db
      .from('comments')
      .insert({
        post_id: input.postId,
        user_id: input.userId || null,
        author_name: input.userName,
        author_email: '',
        author_avatar: input.userAvatar ?? null,
        content: input.content,
        is_approved: false,
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
      this.db.rpc('search_posts' as any, { query, result_limit: 10 }),
      this.db.from('books').select('*').or(`title.ilike.${q},description.ilike.${q}`).limit(5),
    ]);

    const posts = (postsResult.data ?? []).map((row: any) => mapPost(row, []));
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
      .order('name');

    if (error) throw error;

    return (fields ?? []).map((field) => ({
      id: field.id,
      type: 'field' as const,
      label: field.name,
      slug: field.slug,
      url: `/${field.slug}`,
      postCount: field.post_count ?? 0,
      children: ((field as any).categories ?? []).map((cat: any) => ({
        id: cat.id,
        type: 'category' as const,
        label: cat.name,
        slug: cat.slug,
        url: `/${field.slug}/${cat.slug}`,
        postCount: cat.post_count ?? 0,
      })),
    }));
  }
}
