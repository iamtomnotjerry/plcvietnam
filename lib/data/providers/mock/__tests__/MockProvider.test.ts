/**
 * Tests for MockProvider implementation
 * Verifies all ContentRepository methods work correctly with mock data
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockProvider } from '../index';

describe('MockProvider', () => {
  let provider: MockProvider;

  beforeEach(() => {
    provider = new MockProvider();
  });

  describe('Fields', () => {
    it('should return all fields', async () => {
      const fields = await provider.getFields();
      
      expect(fields).toBeDefined();
      expect(Array.isArray(fields)).toBe(true);
      expect(fields.length).toBeGreaterThan(0);
      
      // Verify field structure
      fields.forEach(field => {
        expect(field).toHaveProperty('id');
        expect(field).toHaveProperty('slug');
        expect(field).toHaveProperty('name');
        expect(field).toHaveProperty('description');
        expect(field).toHaveProperty('postCount');
        expect(field.createdAt).toBeInstanceOf(Date);
        expect(field.updatedAt).toBeInstanceOf(Date);
      });
    });

    it('should return field by slug', async () => {
      const field = await provider.getFieldBySlug('plc');
      
      expect(field).toBeDefined();
      expect(field?.slug).toBe('plc');
      expect(field?.name).toBe('Lập trình PLC');
    });

    it('should return null for non-existent field slug', async () => {
      const field = await provider.getFieldBySlug('non-existent');
      
      expect(field).toBeNull();
    });
  });

  describe('Categories', () => {
    it('should return categories by field ID', async () => {
      const categories = await provider.getCategoriesByFieldId('field-1');
      
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      
      // Verify all categories belong to the field
      categories.forEach(category => {
        expect(category.fieldId).toBe('field-1');
        expect(category.field).toBeDefined();
      });
      
      // Verify categories are sorted by order
      for (let i = 1; i < categories.length; i++) {
        expect(categories[i].order).toBeGreaterThanOrEqual(categories[i - 1].order);
      }
    });

    it('should return category by field and category slug', async () => {
      const category = await provider.getCategoryBySlug('plc', 'ladder-logic');
      
      expect(category).toBeDefined();
      expect(category?.slug).toBe('ladder-logic');
      expect(category?.field?.slug).toBe('plc');
    });

    it('should return null for non-existent category', async () => {
      const category = await provider.getCategoryBySlug('plc', 'non-existent');
      
      expect(category).toBeNull();
    });
  });

  describe('Posts', () => {
    it('should return paginated posts', async () => {
      const result = await provider.getPosts({ page: 1, limit: 5 });
      
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(5);
      
      // Verify pagination metadata
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBeGreaterThan(0);
      expect(result.pagination.totalPages).toBeGreaterThan(0);
      
      // Verify post structure
      result.data.forEach(post => {
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('slug');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('content');
        expect(post).toHaveProperty('category');
        expect(post).toHaveProperty('author');
        expect(post).toHaveProperty('tags');
        expect(post).toHaveProperty('readingTimeMinutes');
        expect(post.publishedAt).toBeInstanceOf(Date);
        expect(post.readingTimeMinutes).toBeGreaterThanOrEqual(1);
      });
    });

    it('should sort posts by publishedAt descending by default', async () => {
      const result = await provider.getPosts({ page: 1, limit: 10 });
      
      for (let i = 1; i < result.data.length; i++) {
        expect(result.data[i].publishedAt.getTime()).toBeLessThanOrEqual(
          result.data[i - 1].publishedAt.getTime()
        );
      }
    });

    it('should return post by slug', async () => {
      const post = await provider.getPostBySlug('plc', 'ladder-logic', 'gioi-thieu-ladder-logic');
      
      expect(post).toBeDefined();
      expect(post?.slug).toBe('gioi-thieu-ladder-logic');
      expect(post?.category?.slug).toBe('ladder-logic');
      expect(post?.category?.field?.slug).toBe('plc');
    });

    it('should return null for non-existent post', async () => {
      const post = await provider.getPostBySlug('plc', 'ladder-logic', 'non-existent');
      
      expect(post).toBeNull();
    });

    it('should return posts by category', async () => {
      const result = await provider.getPostsByCategory('cat-1', { page: 1, limit: 10 });
      
      expect(result).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
      
      // Verify all posts belong to the category
      result.data.forEach(post => {
        expect(post.categoryId).toBe('cat-1');
      });
    });

    it('should return posts by tag', async () => {
      const result = await provider.getPostsByTag('co-ban', { page: 1, limit: 10 });
      
      expect(result).toBeDefined();
      expect(result.data.length).toBeGreaterThan(0);
      
      // Verify all posts have the tag
      result.data.forEach(post => {
        const hasTag = post.tags.some(tag => tag.slug === 'co-ban');
        expect(hasTag).toBe(true);
      });
    });

    it('should return related posts', async () => {
      const relatedPosts = await provider.getRelatedPosts('post-1', 3);
      
      expect(relatedPosts).toBeDefined();
      expect(Array.isArray(relatedPosts)).toBe(true);
      expect(relatedPosts.length).toBeLessThanOrEqual(3);
      
      // Verify current post is not in related posts
      relatedPosts.forEach(post => {
        expect(post.id).not.toBe('post-1');
      });
    });

    it('should return recent posts', async () => {
      const recentPosts = await provider.getRecentPosts(5);
      
      expect(recentPosts).toBeDefined();
      expect(recentPosts.length).toBeLessThanOrEqual(5);
      
      // Verify posts are sorted by publishedAt descending
      for (let i = 1; i < recentPosts.length; i++) {
        expect(recentPosts[i].publishedAt.getTime()).toBeLessThanOrEqual(
          recentPosts[i - 1].publishedAt.getTime()
        );
      }
    });
  });

  describe('Tags', () => {
    it('should return all tags', async () => {
      const tags = await provider.getTags();
      
      expect(tags).toBeDefined();
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);
      
      // Verify tag structure
      tags.forEach(tag => {
        expect(tag).toHaveProperty('id');
        expect(tag).toHaveProperty('slug');
        expect(tag).toHaveProperty('name');
        expect(tag).toHaveProperty('postCount');
      });
    });

    it('should return tag by slug', async () => {
      const tag = await provider.getTagBySlug('co-ban');
      
      expect(tag).toBeDefined();
      expect(tag?.slug).toBe('co-ban');
      expect(tag?.name).toBe('Cơ bản');
    });

    it('should return null for non-existent tag', async () => {
      const tag = await provider.getTagBySlug('non-existent');
      
      expect(tag).toBeNull();
    });
  });

  describe('Books', () => {
    it('should return paginated books', async () => {
      const result = await provider.getBooks({ page: 1, limit: 3 });
      
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(3);
      
      // Verify book structure
      result.data.forEach(book => {
        expect(book).toHaveProperty('id');
        expect(book).toHaveProperty('slug');
        expect(book).toHaveProperty('title');
        expect(book).toHaveProperty('description');
        expect(book).toHaveProperty('coverImageUrl');
        expect(book).toHaveProperty('authorName');
        expect(book.createdAt).toBeInstanceOf(Date);
      });
    });

    it('should filter books by series', async () => {
      const result = await provider.getBooks({ series: 'Industrial Automation Series' });
      
      expect(result).toBeDefined();
      
      // Verify all books belong to the series
      result.data.forEach(book => {
        expect(book.series).toBe('Industrial Automation Series');
      });
    });

    it('should return featured books', async () => {
      const featuredBooks = await provider.getFeaturedBooks(3);
      
      expect(featuredBooks).toBeDefined();
      expect(featuredBooks.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Comments', () => {
    it('should return empty array for post with no comments', async () => {
      const comments = await provider.getCommentsByPostId('post-1');
      
      expect(comments).toBeDefined();
      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBe(0);
    });

    it('should create and retrieve comment', async () => {
      const input = {
        postId: 'post-1',
        userId: 'user-1',
        userName: 'Test User',
        userAvatar: 'https://example.com/avatar.jpg',
        content: 'Great article!',
      };
      
      const comment = await provider.createComment(input);
      
      expect(comment).toBeDefined();
      expect(comment.id).toBeDefined();
      expect(comment.postId).toBe(input.postId);
      expect(comment.userId).toBe(input.userId);
      expect(comment.userName).toBe(input.userName);
      expect(comment.content).toBe(input.content);
      expect(comment.createdAt).toBeInstanceOf(Date);
      
      // Verify comment can be retrieved
      const comments = await provider.getCommentsByPostId('post-1');
      expect(comments.length).toBe(1);
      expect(comments[0].id).toBe(comment.id);
    });
  });

  describe('Search', () => {
    it('should return empty results for query less than 2 characters', async () => {
      const results = await provider.search('a');
      
      expect(results).toBeDefined();
      expect(results.posts).toEqual([]);
      expect(results.books).toEqual([]);
      expect(results.totalResults).toBe(0);
    });

    it('should search posts by title', async () => {
      const results = await provider.search('ladder');
      
      expect(results).toBeDefined();
      expect(results.posts.length).toBeGreaterThan(0);
      
      // Verify results contain the query
      results.posts.forEach(post => {
        const matchesTitle = post.title.toLowerCase().includes('ladder');
        const matchesExcerpt = post.excerpt.toLowerCase().includes('ladder');
        const matchesCategory = post.category?.name.toLowerCase().includes('ladder');
        const matchesTags = post.tags.some(tag => tag.name.toLowerCase().includes('ladder'));
        
        expect(matchesTitle || matchesExcerpt || matchesCategory || matchesTags).toBe(true);
      });
    });

    it('should search books by title', async () => {
      const results = await provider.search('plc');
      
      expect(results).toBeDefined();
      expect(results.books.length).toBeGreaterThan(0);
      
      // Verify results contain the query
      results.books.forEach(book => {
        const matchesTitle = book.title.toLowerCase().includes('plc');
        const matchesDescription = book.description.toLowerCase().includes('plc');
        
        expect(matchesTitle || matchesDescription).toBe(true);
      });
    });

    it('should return total results count', async () => {
      const results = await provider.search('tự động');
      
      expect(results.totalResults).toBe(results.posts.length + results.books.length);
    });
  });

  describe('Author', () => {
    it('should return author information', async () => {
      const author = await provider.getAuthor();
      
      expect(author).toBeDefined();
      expect(author).toHaveProperty('id');
      expect(author).toHaveProperty('name');
      expect(author).toHaveProperty('email');
      expect(author).toHaveProperty('bio');
      expect(author).toHaveProperty('expertise');
      expect(author).toHaveProperty('certifications');
      expect(author).toHaveProperty('socialLinks');
      
      expect(Array.isArray(author.expertise)).toBe(true);
      expect(Array.isArray(author.certifications)).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('should return navigation tree', async () => {
      const tree = await provider.getNavigationTree();
      
      expect(tree).toBeDefined();
      expect(Array.isArray(tree)).toBe(true);
      expect(tree.length).toBeGreaterThan(0);
      
      // Verify tree structure
      tree.forEach(fieldNode => {
        expect(fieldNode.type).toBe('field');
        expect(fieldNode).toHaveProperty('id');
        expect(fieldNode).toHaveProperty('label');
        expect(fieldNode).toHaveProperty('slug');
        expect(fieldNode).toHaveProperty('url');
        expect(fieldNode).toHaveProperty('children');
        
        // Verify category nodes
        fieldNode.children?.forEach(categoryNode => {
          expect(categoryNode.type).toBe('category');
          expect(categoryNode).toHaveProperty('children');
          
          // Verify post nodes
          categoryNode.children?.forEach(postNode => {
            expect(postNode.type).toBe('post');
            expect(postNode).toHaveProperty('url');
          });
        });
      });
    });
  });
});
