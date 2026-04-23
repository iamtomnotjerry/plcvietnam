/**
 * Structured Data (JSON-LD) utilities for SEO
 */

import type { Post, Author, Book } from '@/lib/types/domain';

export interface WebSiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  description: string;
  url: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

export interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article' | 'BlogPosting' | 'TechArticle';
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  author: {
    '@type': 'Person';
    name: string;
    url?: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
  keywords?: string[];
  articleSection?: string;
  wordCount?: number;
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

export interface PersonSchema {
  '@context': 'https://schema.org';
  '@type': 'Person';
  name: string;
  description: string;
  image?: string;
  url: string;
  sameAs?: string[];
  jobTitle?: string;
  worksFor?: {
    '@type': 'Organization';
    name: string;
  };
}

export interface BookSchema {
  '@context': 'https://schema.org';
  '@type': 'Book';
  name: string;
  description: string;
  image?: string;
  author: {
    '@type': 'Person';
    name: string;
  };
  datePublished?: string;
  inLanguage?: string;
  bookFormat?: string;
}

/**
 * Generate WebSite schema for homepage
 */
export function generateWebSiteSchema(baseUrl: string): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Automation Blog',
    description: 'Blog chuyên về tự động hóa công nghiệp, PLC, SCADA, và Siemens Automation',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Article schema for blog post
 */
export function generateArticleSchema(
  post: Post,
  author: Author,
  baseUrl: string,
  postUrl: string
): ArticleSchema {
  const wordCount = post.content.split(/\s+/).length;

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: post.title,
    description: post.excerpt,
    image: post.thumbnailUrl,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: author.name,
      url: `${baseUrl}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Automation Blog',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: post.tags.map((tag) => tag.name),
    articleSection: post.category?.name,
    wordCount,
  };
}

/**
 * Generate Breadcrumb schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url?: string }>
): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Person schema for author page
 */
export function generatePersonSchema(author: Author, baseUrl: string): PersonSchema {
  const sameAs: string[] = [];
  if (author.socialLinks.linkedin) sameAs.push(author.socialLinks.linkedin);
  if (author.socialLinks.github) sameAs.push(author.socialLinks.github);
  if (author.socialLinks.twitter) sameAs.push(author.socialLinks.twitter);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    description: author.bio,
    image: author.avatarUrl,
    url: `${baseUrl}/about`,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    jobTitle: 'Chuyên gia Tự động hóa Công nghiệp',
  };
}

/**
 * Generate Book schema
 */
export function generateBookSchema(book: Book): BookSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    description: book.description,
    image: book.coverImageUrl,
    author: {
      '@type': 'Person',
      name: book.authorName,
    },
    datePublished: book.publishedYear?.toString(),
    inLanguage: 'vi',
    bookFormat: 'EBook',
  };
}

/**
 * Render JSON-LD script tag
 */
export function renderJsonLd(
  data: WebSiteSchema | ArticleSchema | BreadcrumbSchema | PersonSchema | BookSchema
): string {
  return JSON.stringify(data);
}
