/**
 * Unit tests for searchContent function
 * Tests Requirements: 9.2, 9.3, 9.5, 9.6
 */

import { describe, it, expect } from 'vitest';
import { searchContent } from './searchEngine';
import type { Post, Book, Category, Tag } from '@/lib/types/domain';

// Test data helpers
const createPost = (overrides: Partial<Post> = {}): Post => ({
  id: 'post-1',
  slug: 'test-post',
  title: 'Test Post',
  excerpt: 'Test excerpt',
  content: 'Test content',
  categoryId: 'cat-1',
  category: {
    id: 'cat-1',
    slug: 'test-category',
    name: 'Test Category',
    description: 'Test category description',
    fieldId: 'field-1',
    postCount: 1,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  authorId: 'author-1',
  tags: [],
  publishedAt: new Date(),
  updatedAt: new Date(),
  viewCount: 0,
  readingTimeMinutes: 5,
  seo: {
    title: 'Test Post',
    description: 'Test excerpt',
    keywords: [],
  },
  ...overrides,
});

const createBook = (overrides: Partial<Book> = {}): Book => ({
  id: 'book-1',
  slug: 'test-book',
  title: 'Test Book',
  description: 'Test book description',
  coverImageUrl: '/test.jpg',
  authorName: 'Test Author',
  createdAt: new Date(),
  ...overrides,
});

describe('searchContent', () => {
  describe('Requirement 9.2: Query length validation', () => {
    it('should return empty results for empty query', () => {
      const posts = [createPost()];
      const books = [createBook()];
      
      const result = searchContent('', posts, books);
      
      expect(result.posts).toEqual([]);
      expect(result.books).toEqual([]);
      expect(result.totalResults).toBe(0);
    });

    it('should return empty results for single character query', () => {
      const posts = [createPost({ title: 'A Post' })];
      const books = [createBook({ title: 'A Book' })];
      
      const result = searchContent('a', posts, books);
      
      expect(result.posts).toEqual([]);
      expect(result.books).toEqual([]);
      expect(result.totalResults).toBe(0);
    });

    it('should return results for 2 character query', () => {
      const posts = [createPost({ title: 'PLC Programming' })];
      const books = [createBook({ title: 'PLC Handbook' })];
      
      const result = searchContent('pl', posts, books);
      
      expect(result.posts.length).toBe(1);
      expect(result.books.length).toBe(1);
      expect(result.totalResults).toBe(2);
    });

    it('should trim whitespace from query', () => {
      const posts = [createPost({ title: 'Test' })];
      const books: Book[] = [];
      
      const result = searchContent('  te  ', posts, books);
      
      expect(result.posts.length).toBe(1);
    });
  });

  describe('Requirement 9.3: Post search fields (case-insensitive)', () => {
    it('should find posts by title match', () => {
      const posts = [
        createPost({ id: 'p1', title: 'Ladder Logic Programming' }),
        createPost({ id: 'p2', title: 'SCADA Systems' }),
      ];
      const books: Book[] = [];
      
      const result = searchContent('ladder', posts, books);
      
      expect(result.posts.length).toBe(1);
      expect(result.posts[0].id).toBe('p1');
    });

    it('should find posts by title match (case-insensitive)', () => {
      const posts = [
        createPost({ title: 'Ladder Logic Programming' }),
      ];
      const books: Book[] = [];
      
      const result = searchContent('LADDER', posts, books);
      
      expect(result.posts.length).toBe(1);
    });

    it('should find posts by excerpt match', () => {
      const posts = [
        createPost({ id: 'p1', excerpt: 'Learn about PLC programming' }),
        createPost({ id: 'p2', excerpt: 'SCADA tutorial' }),
      ];
      const books: Book[] = [];
      
      const result = searchContent('plc', posts, books);
      
      expect(result.posts.length).toBe(1);
      expect(result.posts[0].id).toBe('p1');
    });

    it('should find posts by excerpt match (case-insensitive)', () => {
      const posts = [
        createPost({ excerpt: 'Learn about PLC programming' }),
      ];
      const books: Book[] = [];
      
      const result = searchContent('PLC', posts, books);
      
      expect(result.posts.length).toBe(1);
    });

    it('should find posts by category name match', () => {
      const posts = [
        createPost({
          id: 'p1',
          category: {
            id: 'cat-1',
            slug: 'ladder-logic',
            name: 'Ladder Logic',
            description: 'Test',
            fieldId: 'field-1',
            postCount: 1,
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }),
        createPost({
          id: 'p2',
          category: {
            id: 'cat-2',
            slug: 'scada',
            name: 'SCADA',
            description: 'Test',
            fieldId: 'field-1',
            postCount: 1,
            order: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }),
      ];
      const books: Book[] = [];
      
      const result = searchContent('ladder', posts, books);
      
      expect(result.posts.length).toBe(1);
      expect(result.posts[0].id).toBe('p1');
    });

    it('should find posts by category name match (case-insensitive)', () => {
      const posts = [
        createPost({
          category: {
            id: 'cat-1',
            slug: 'ladder-logic',
            name: 'Ladder Logic',
            description: 'Test',
            fieldId: 'field-1',
            postCount: 1,
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }),
      ];
      const books: Book[] = [];
      
      const result = searchContent('LADDER', posts, books);
      
      expect(result.posts.length).toBe(1);
    });

    it('should find posts by tag name match', () => {
      const posts = [
        createPost({
          id: 'p1',
          tags: [
            { id: 't1', slug: 'automation', name: 'Automation', postCount: 5 },
            { id: 't2', slug: 'plc', name: 'PLC', postCount: 10 },
          ],
        }),
        createPost({
          id: 'p2',
          tags: [
            { id: 't3', slug: 'scada', name: 'SCADA', postCount: 3 },
          ],
        }),
      ];
      const books: Book[] = [];
      
      const result = searchContent('automation', posts, books);
      
      expect(result.posts.length).toBe(1);
      expect(result.posts[0].id).toBe('p1');
    });

    it('should find posts by tag name match (case-insensitive)', () => {
      const posts = [
        createPost({
          tags: [
            { id: 't1', slug: 'automation', name: 'Automation', postCount: 5 },
          ],
        }),
      ];
      const books: Book[] = [];
      
      const result = searchContent('AUTOMATION', posts, books);
      
      expect(result.posts.length).toBe(1);
    });

    it('should handle posts without category', () => {
      const posts = [
        createPost({ category: undefined }),
      ];
      const books: Book[] = [];
      
      const result = searchContent('test', posts, books);
      
      // Should not throw error, should still search other fields
      expect(result.posts.length).toBe(1); // Matches title "Test Post"
    });

    it('should find posts matching multiple fields', () => {
      const posts = [
        createPost({
          title: 'PLC Programming',
          excerpt: 'Learn PLC basics',
          tags: [{ id: 't1', slug: 'plc', name: 'PLC', postCount: 10 }],
        }),
      ];
      const books: Book[] = [];
      
      const result = searchContent('plc', posts, books);
      
      expect(result.posts.length).toBe(1);
    });
  });

  describe('Requirement 9.3: Book search fields (case-insensitive)', () => {
    it('should find books by title match', () => {
      const posts: Post[] = [];
      const books = [
        createBook({ id: 'b1', title: 'PLC Programming Handbook' }),
        createBook({ id: 'b2', title: 'SCADA Guide' }),
      ];
      
      const result = searchContent('handbook', posts, books);
      
      expect(result.books.length).toBe(1);
      expect(result.books[0].id).toBe('b1');
    });

    it('should find books by title match (case-insensitive)', () => {
      const posts: Post[] = [];
      const books = [
        createBook({ title: 'PLC Programming Handbook' }),
      ];
      
      const result = searchContent('HANDBOOK', posts, books);
      
      expect(result.books.length).toBe(1);
    });

    it('should find books by description match', () => {
      const posts: Post[] = [];
      const books = [
        createBook({ id: 'b1', description: 'Comprehensive guide to automation' }),
        createBook({ id: 'b2', description: 'SCADA tutorial' }),
      ];
      
      const result = searchContent('automation', posts, books);
      
      expect(result.books.length).toBe(1);
      expect(result.books[0].id).toBe('b1');
    });

    it('should find books by description match (case-insensitive)', () => {
      const posts: Post[] = [];
      const books = [
        createBook({ description: 'Comprehensive guide to automation' }),
      ];
      
      const result = searchContent('AUTOMATION', posts, books);
      
      expect(result.books.length).toBe(1);
    });

    it('should find books matching multiple fields', () => {
      const posts: Post[] = [];
      const books = [
        createBook({
          title: 'PLC Handbook',
          description: 'Learn PLC programming',
        }),
      ];
      
      const result = searchContent('plc', posts, books);
      
      expect(result.books.length).toBe(1);
    });
  });

  describe('Requirement 9.5, 9.6: SearchResults structure', () => {
    it('should return SearchResults with posts, books, and totalResults', () => {
      const posts = [
        createPost({ title: 'PLC Post 1' }),
        createPost({ title: 'PLC Post 2' }),
      ];
      const books = [
        createBook({ title: 'PLC Book 1' }),
      ];
      
      const result = searchContent('plc', posts, books);
      
      expect(result).toHaveProperty('posts');
      expect(result).toHaveProperty('books');
      expect(result).toHaveProperty('totalResults');
      expect(result.posts.length).toBe(2);
      expect(result.books.length).toBe(1);
      expect(result.totalResults).toBe(3);
    });

    it('should calculate totalResults correctly', () => {
      const posts = [
        createPost({ id: 'p1', title: 'Automation Post' }),
        createPost({ id: 'p2', excerpt: 'Learn automation' }),
        createPost({ id: 'p3', title: 'SCADA' }),
      ];
      const books = [
        createBook({ id: 'b1', title: 'Automation Book' }),
        createBook({ id: 'b2', title: 'PLC Guide' }),
      ];
      
      const result = searchContent('automation', posts, books);
      
      expect(result.posts.length).toBe(2);
      expect(result.books.length).toBe(1);
      expect(result.totalResults).toBe(3);
    });

    it('should return zero totalResults when no matches', () => {
      const posts = [createPost({ title: 'PLC' })];
      const books = [createBook({ title: 'SCADA' })];
      
      const result = searchContent('nonexistent', posts, books);
      
      expect(result.posts.length).toBe(0);
      expect(result.books.length).toBe(0);
      expect(result.totalResults).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty posts and books arrays', () => {
      const result = searchContent('test', [], []);
      
      expect(result.posts).toEqual([]);
      expect(result.books).toEqual([]);
      expect(result.totalResults).toBe(0);
    });

    it('should handle special characters in query', () => {
      const posts = [createPost({ title: 'C++ Programming' })];
      const books: Book[] = [];
      
      const result = searchContent('c++', posts, books);
      
      expect(result.posts.length).toBe(1);
    });

    it('should handle partial word matches', () => {
      const posts = [createPost({ title: 'Programming' })];
      const books: Book[] = [];
      
      const result = searchContent('prog', posts, books);
      
      expect(result.posts.length).toBe(1);
    });

    it('should not match posts with only 1 character overlap', () => {
      const posts = [createPost({ title: 'Test' })];
      const books: Book[] = [];
      
      const result = searchContent('x', posts, books);
      
      expect(result.posts.length).toBe(0);
    });
  });
});
