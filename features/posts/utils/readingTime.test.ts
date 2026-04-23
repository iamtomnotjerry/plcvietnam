/**
 * Tests for Reading Time Calculation
 * Validates Requirements 13.1, 13.2
 */

import { describe, it, expect } from 'vitest';
import { calculateReadingTime } from './readingTime';

describe('calculateReadingTime', () => {
  describe('basic functionality', () => {
    it('returns minimum 1 minute for empty content', () => {
      expect(calculateReadingTime('')).toBe(1);
    });

    it('returns minimum 1 minute for very short content', () => {
      expect(calculateReadingTime('Hello')).toBe(1);
      expect(calculateReadingTime('Hello world')).toBe(1);
    });

    it('calculates correct reading time for 200 words', () => {
      const words200 = Array(200).fill('word').join(' ');
      expect(calculateReadingTime(words200)).toBe(1);
    });

    it('calculates correct reading time for 400 words', () => {
      const words400 = Array(400).fill('word').join(' ');
      expect(calculateReadingTime(words400)).toBe(2);
    });

    it('rounds up partial minutes', () => {
      // 201 words should round up to 2 minutes
      const words201 = Array(201).fill('word').join(' ');
      expect(calculateReadingTime(words201)).toBe(2);
    });
  });

  describe('HTML tag handling', () => {
    it('strips HTML tags before counting words', () => {
      const htmlContent = '<p>Hello world</p>';
      expect(calculateReadingTime(htmlContent)).toBe(1);
    });

    it('handles complex HTML with multiple tags', () => {
      const htmlContent = '<div><h1>Title</h1><p>This is a <strong>test</strong> paragraph.</p></div>';
      // Words: Title, This, is, a, test, paragraph = 6 words
      expect(calculateReadingTime(htmlContent)).toBe(1);
    });

    it('handles self-closing tags', () => {
      const htmlContent = '<img src="test.jpg" /><br />Hello world';
      expect(calculateReadingTime(htmlContent)).toBe(1);
    });
  });

  describe('whitespace normalization', () => {
    it('normalizes multiple spaces to single space', () => {
      const content = 'Hello    world    test';
      expect(calculateReadingTime(content)).toBe(1);
    });

    it('normalizes newlines and tabs', () => {
      const content = 'Hello\n\nworld\t\ttest';
      expect(calculateReadingTime(content)).toBe(1);
    });

    it('trims leading and trailing whitespace', () => {
      const content = '   Hello world   ';
      expect(calculateReadingTime(content)).toBe(1);
    });

    it('handles mixed whitespace characters', () => {
      const content = '  Hello  \n\n  world  \t  test  ';
      expect(calculateReadingTime(content)).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('handles content with only HTML tags', () => {
      const htmlOnly = '<div><p></p><span></span></div>';
      expect(calculateReadingTime(htmlOnly)).toBe(1);
    });

    it('handles content with only whitespace', () => {
      const whitespaceOnly = '   \n\n\t\t   ';
      expect(calculateReadingTime(whitespaceOnly)).toBe(1);
    });

    it('filters out empty strings after split', () => {
      const content = 'word  word  word'; // Multiple spaces create empty strings
      expect(calculateReadingTime(content)).toBe(1);
    });
  });

  describe('realistic content', () => {
    it('calculates reading time for typical blog post', () => {
      // Simulate a 600-word blog post with HTML
      const words = Array(600).fill('word').join(' ');
      const blogPost = `
        <article>
          <h1>Blog Title</h1>
          <p>${words}</p>
          <img src="image.jpg" alt="test" />
        </article>
      `;
      // 600 words + "Blog" + "Title" = 602 words
      // 602 / 200 = 3.01 → ceil = 4 minutes
      expect(calculateReadingTime(blogPost)).toBe(4);
    });

    it('handles content with inline styles and attributes', () => {
      const content = '<div style="color: red;" class="test" id="main">Hello world test</div>';
      expect(calculateReadingTime(content)).toBe(1);
    });
  });
});
