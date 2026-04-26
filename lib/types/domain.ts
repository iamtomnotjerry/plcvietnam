/**
 * Shared domain types for the PLC Việt Nam
 * Matches design document specifications
 */

export interface Field {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon?: string;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  fieldId: string;
  field?: Field;
  postCount: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PostPublicationStatus = 'draft' | 'published';

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown or HTML
  thumbnailUrl?: string;
  categoryId: string;
  category?: Category;
  authorId: string;
  author?: Author;
  tags: Tag[];
  /** Draft posts are hidden from public listings and URLs. Omitted = published. */
  status?: PostPublicationStatus;
  publishedAt: Date;
  updatedAt: Date;
  viewCount: number;
  readingTimeMinutes: number; // Calculated field
  seo: SEOMetadata;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
  postCount: number;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  authorName: string;
  series?: string;
  volume?: number; // Tập số (1, 2, 3...)
  publisher?: string; // Nhà xuất bản
  publishedYear?: number;
  pages?: number; // Số trang
  isbn?: string;
  downloadUrl?: string;
  externalUrl?: string;
  featured?: boolean;
  createdAt: Date;
}

export interface Author {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl?: string;
  expertise: string[];
  certifications: string[];
  socialLinks: SocialLinks;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SEOMetadata {
  title: string;
  description: string;
  ogImage?: string;
  keywords: string[];
}

export interface SocialLinks {
  email?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
}

export interface NavigationNode {
  id: string;
  type: 'field' | 'category' | 'post';
  label: string;
  slug: string;
  url: string;
  children?: NavigationNode[];
  postCount?: number;
}
