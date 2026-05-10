/**
 * Validation Schemas
 * Zod schemas for runtime validation
 */

import { z } from 'zod';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

// UUID validation (replaces deprecated .uuid())
export const UUIDSchema = z
  .string()
  .refine(
    (val) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
    'ID không hợp lệ'
  );

// URL validation (replaces deprecated .url())
export const URLSchema = z.string().refine((val) => {
  try {
    new URL(val);
    return true;
  } catch {
    return false;
  }
}, 'URL không hợp lệ');

// Slug validation
export const SlugSchema = z
  .string()
  .min(1, 'Slug không được để trống')
  .max(200, 'Slug không được vượt quá 200 ký tự')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang');

// Email validation
export const EmailSchema = z
  .string()
  .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Email không hợp lệ')
  .refine((v) => v.length <= 255, 'Email không được vượt quá 255 ký tự');

// Password validation
export const PasswordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .max(100, 'Mật khẩu không được vượt quá 100 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
  .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
  .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số')
  .regex(/[^A-Za-z0-9]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt');

// Pagination schema
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20), // Max 100 to prevent abuse
});

// ============================================================================
// POST SCHEMAS
// ============================================================================

export const CreatePostSchema = z.object({
  title: z
    .string()
    .min(1, 'Tiêu đề không được để trống')
    .max(500, 'Tiêu đề không được vượt quá 500 ký tự'),
  slug: SlugSchema,
  excerpt: z.string().max(1000, 'Mô tả ngắn không được vượt quá 1000 ký tự').optional(),
  content: z.string().min(1, 'Nội dung không được để trống'),
  thumbnail_url: URLSchema.optional(),
  category_id: UUIDSchema,
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  published_at: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), 'published_at phải là ISO datetime hợp lệ')
    .optional(),
  meta_title: z.string().max(200, 'Meta title không được vượt quá 200 ký tự').optional(),
  meta_description: z
    .string()
    .max(500, 'Meta description không được vượt quá 500 ký tự')
    .optional(),
  meta_keywords: z.array(z.string()).optional(),
  tag_ids: z.array(UUIDSchema).default([]),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export const GetPostsSchema = PaginationSchema.extend({
  category_id: UUIDSchema.optional(),
  tag_id: UUIDSchema.optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  author_id: UUIDSchema.optional(),
  search: z.string().max(200).optional(),
});

// ============================================================================
// BOOK SCHEMAS
// ============================================================================

export const CreateBookSchema = z.object({
  title: z
    .string()
    .min(1, 'Tiêu đề không được để trống')
    .max(500, 'Tiêu đề không được vượt quá 500 ký tự'),
  slug: SlugSchema,
  description: z.string().max(2000, 'Mô tả không được vượt quá 2000 ký tự').optional(),
  content: z.string().min(1, 'Nội dung không được để trống').optional(),
  cover_url: URLSchema.optional(),
  author_id: UUIDSchema.optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft').optional(),
  published_at: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), 'published_at phải là ISO datetime hợp lệ')
    .optional(),
  is_featured: z.boolean().default(false),
  download_url: URLSchema.optional(),
  page_count: z.number().int().min(1).optional(),
  file_size: z.string().max(50).optional(),
});

/** Admin CMS — JSON body from `AdminBooksClient` (camelCase). */
export const AdminBookBodySchema = z.object({
  slug: SlugSchema,
  title: z.string().min(1).max(500),
  description: z.string().max(2000).nullable().optional(),
  coverImageUrl: z.string().max(2000).nullable().optional(),
  authorName: z.string().max(200).nullable().optional(),
  series: z.string().max(500).nullable().optional(),
  volume: z.number().int().positive().nullable().optional(),
  publisher: z.string().max(200).nullable().optional(),
  publishedYear: z.number().int().min(1900).max(2100).nullable().optional(),
  pages: z.number().int().positive().nullable().optional(),
  isbn: z.string().max(40).nullable().optional(),
  downloadUrl: z.string().max(2000).nullable().optional(),
  externalUrl: z.string().max(2000).nullable().optional(),
  featured: z.boolean().optional(),
});

export const AdminBookPatchSchema = AdminBookBodySchema.partial();

export const UpdateBookSchema = CreateBookSchema.partial().extend({
  id: UUIDSchema,
});

export const GetBooksSchema = PaginationSchema.extend({
  author_id: UUIDSchema.optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  is_featured: z.boolean().optional(),
  search: z.string().max(200).optional(),
});

// ============================================================================
// COMMENT SCHEMAS
// ============================================================================

export const CreateCommentSchema = z.object({
  post_id: UUIDSchema,
  parent_id: UUIDSchema.optional().nullable(),
  content: z
    .string()
    .min(1, 'Nội dung không được để trống')
    .max(2000, 'Nội dung không được vượt quá 2000 ký tự'),
});

export const UpdateCommentSchema = z.object({
  id: UUIDSchema,
  content: z
    .string()
    .min(1, 'Nội dung không được để trống')
    .max(2000, 'Nội dung không được vượt quá 2000 ký tự'),
});

export const GetCommentsSchema = PaginationSchema.extend({
  post_id: UUIDSchema.optional(),
  user_id: UUIDSchema.optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

// ============================================================================
// CATEGORY SCHEMAS
// ============================================================================

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Tên không được để trống').max(200, 'Tên không được vượt quá 200 ký tự'),
  slug: SlugSchema,
  description: z.string().max(1000, 'Mô tả không được vượt quá 1000 ký tự').optional(),
  field_id: UUIDSchema,
  display_order: z.number().int().min(0).default(0),
});

export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  id: UUIDSchema,
});

// ============================================================================
// TAG SCHEMAS
// ============================================================================

export const CreateTagSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống').max(100, 'Tên không được vượt quá 100 ký tự'),
  slug: SlugSchema,
  description: z.string().max(500, 'Mô tả không được vượt quá 500 ký tự').optional(),
});

export const UpdateTagSchema = CreateTagSchema.partial().extend({
  id: UUIDSchema,
});

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const CreateUserSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  full_name: z
    .string()
    .min(1, 'Họ tên không được để trống')
    .max(200, 'Họ tên không được vượt quá 200 ký tự'),
  role: z.enum(['admin', 'author', 'reader']).default('reader'),
});

export const UpdateUserSchema = z.object({
  id: UUIDSchema,
  email: EmailSchema.optional(),
  full_name: z
    .string()
    .min(1, 'Họ tên không được để trống')
    .max(200, 'Họ tên không được vượt quá 200 ký tự')
    .optional(),
  role: z.enum(['admin', 'author', 'reader']).optional(),
  avatar_url: URLSchema.optional(),
  bio: z.string().max(1000, 'Tiểu sử không được vượt quá 1000 ký tự').optional(),
});

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const SignUpSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  full_name: z
    .string()
    .min(1, 'Họ tên không được để trống')
    .max(200, 'Họ tên không được vượt quá 200 ký tự'),
  captchaToken: z.string().optional(),
});

export const SignInSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Mật khẩu không được để trống'),
  captchaToken: z.string().optional(),
});

export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
  captchaToken: z.string().optional(),
});

/** Same shape as forgot-password: email + optional Turnstile token. */
export const ResendConfirmationSchema = ForgotPasswordSchema;

export const ResetPasswordSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

// ============================================================================
// FIELD SCHEMAS
// ============================================================================

export const CreateFieldSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống').max(200, 'Tên không được vượt quá 200 ký tự'),
  slug: SlugSchema,
  description: z.string().max(1000, 'Mô tả không được vượt quá 1000 ký tự').optional(),
  display_order: z.number().int().min(0).default(0),
});

export const UpdateFieldSchema = CreateFieldSchema.partial().extend({
  id: UUIDSchema,
});

// ============================================================================
// AUTHOR SCHEMAS
// ============================================================================

export const CreateAuthorSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống').max(200, 'Tên không được vượt quá 200 ký tự'),
  slug: SlugSchema,
  bio: z.string().max(2000, 'Tiểu sử không được vượt quá 2000 ký tự').optional(),
  avatar_url: URLSchema.optional(),
  email: EmailSchema.optional(),
  website: URLSchema.optional(),
});

export const UpdateAuthorSchema = CreateAuthorSchema.partial().extend({
  id: UUIDSchema,
});

// ============================================================================
// SEARCH SCHEMA
// ============================================================================

export const SearchSchema = z.object({
  q: z
    .string()
    .min(1, 'Từ khóa tìm kiếm không được để trống')
    .max(200, 'Từ khóa tìm kiếm không được vượt quá 200 ký tự'),
  type: z.enum(['posts', 'books', 'all']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
export type GetPostsInput = z.infer<typeof GetPostsSchema>;

export type CreateBookInput = z.infer<typeof CreateBookSchema>;
export type UpdateBookInput = z.infer<typeof UpdateBookSchema>;
export type GetBooksInput = z.infer<typeof GetBooksSchema>;

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;
export type GetCommentsInput = z.infer<typeof GetCommentsSchema>;

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

export type CreateTagInput = z.infer<typeof CreateTagSchema>;
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>;

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export type CreateFieldInput = z.infer<typeof CreateFieldSchema>;
export type UpdateFieldInput = z.infer<typeof UpdateFieldSchema>;

export type CreateAuthorInput = z.infer<typeof CreateAuthorSchema>;
export type UpdateAuthorInput = z.infer<typeof UpdateAuthorSchema>;

export type SearchInput = z.infer<typeof SearchSchema>;
