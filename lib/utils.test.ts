import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateReadingTime, generateSlug } from './utils';

describe('calculateReadingTime', () => {
  it('returns 1 minute for empty or very short text', () => {
    expect(calculateReadingTime('')).toBe(0);
    expect(calculateReadingTime('Hello')).toBe(1);
  });

  it('calculates reading time correctly for known word counts', () => {
    const words200 = Array(200).fill('word').join(' ');
    expect(calculateReadingTime(words200)).toBe(1);
    
    const words400 = Array(400).fill('word').join(' ');
    expect(calculateReadingTime(words400)).toBe(2);
  });

  // Property-based test
  it('reading time is always non-negative', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const readingTime = calculateReadingTime(text);
        expect(readingTime).toBeGreaterThanOrEqual(0);
      })
    );
  });

  // Property-based test
  it('reading time increases with more words', () => {
    fc.assert(
      fc.property(fc.array(fc.string(), { minLength: 1, maxLength: 100 }), (words) => {
        const text1 = words.join(' ');
        const text2 = [...words, ...words].join(' ');
        const time1 = calculateReadingTime(text1);
        const time2 = calculateReadingTime(text2);
        expect(time2).toBeGreaterThanOrEqual(time1);
      })
    );
  });
});

describe('generateSlug', () => {
  it('converts text to lowercase', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(generateSlug('This is a test')).toBe('this-is-a-test');
  });

  it('removes special characters', () => {
    expect(generateSlug('Hello! World?')).toBe('hello-world');
  });

  // Property-based test
  it('slug contains only lowercase letters, numbers, and hyphens', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const slug = generateSlug(text);
        const validSlugPattern = /^[a-z0-9-]*$/;
        expect(validSlugPattern.test(slug)).toBe(true);
      })
    );
  });

  // Property-based test
  it('slug has no leading or trailing hyphens', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const slug = generateSlug(text);
        if (slug.length > 0) {
          expect(slug[0]).not.toBe('-');
          expect(slug[slug.length - 1]).not.toBe('-');
        }
      })
    );
  });
});
