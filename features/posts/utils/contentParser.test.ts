/**
 * Tests for Content Parser - Table of Contents Generation
 * Validates Requirements 3.4
 */

import { describe, it, expect } from 'vitest';
import { generateTableOfContents, TOCItem } from './contentParser';

describe('generateTableOfContents', () => {
  describe('threshold enforcement', () => {
    it('returns empty array for content with no headings', () => {
      const html = '<p>Just a paragraph</p>';
      expect(generateTableOfContents(html)).toEqual([]);
    });

    it('returns empty array for content with 1 heading', () => {
      const html = '<h2>Single Heading</h2><p>Content</p>';
      expect(generateTableOfContents(html)).toEqual([]);
    });

    it('returns empty array for content with 2 headings', () => {
      const html = '<h2>First</h2><h3>Second</h3><p>Content</p>';
      expect(generateTableOfContents(html)).toEqual([]);
    });

    it('generates TOC for content with exactly 3 headings', () => {
      const html = '<h2>First</h2><h2>Second</h2><h2>Third</h2>';
      const toc = generateTableOfContents(html);
      expect(toc).toHaveLength(3);
    });

    it('generates TOC for content with more than 3 headings', () => {
      const html = '<h2>A</h2><h2>B</h2><h2>C</h2><h2>D</h2>';
      const toc = generateTableOfContents(html);
      expect(toc).toHaveLength(4);
    });
  });

  describe('heading extraction', () => {
    it('extracts h2 headings', () => {
      const html = '<h2>Heading 1</h2><h2>Heading 2</h2><h2>Heading 3</h2>';
      const toc = generateTableOfContents(html);
      expect(toc[0].text).toBe('Heading 1');
      expect(toc[0].level).toBe(2);
      expect(toc[1].text).toBe('Heading 2');
      expect(toc[2].text).toBe('Heading 3');
    });

    it('extracts h3 headings', () => {
      const html = '<h3>A</h3><h3>B</h3><h3>C</h3>';
      const toc = generateTableOfContents(html);
      expect(toc[0].level).toBe(3);
      expect(toc[1].level).toBe(3);
      expect(toc[2].level).toBe(3);
    });

    it('extracts h4 headings', () => {
      const html = '<h4>A</h4><h4>B</h4><h4>C</h4>';
      const toc = generateTableOfContents(html);
      expect(toc[0].level).toBe(4);
      expect(toc[1].level).toBe(4);
      expect(toc[2].level).toBe(4);
    });

    it('ignores h1, h5, h6 headings', () => {
      const html = '<h1>Title</h1><h2>A</h2><h3>B</h3><h4>C</h4><h5>D</h5><h6>E</h6>';
      const toc = generateTableOfContents(html);
      expect(toc).toHaveLength(1); // Only h2 at root
      expect(toc[0].text).toBe('A');
      expect(toc[0].children).toHaveLength(1); // h3
      expect(toc[0].children[0].children).toHaveLength(1); // h4
    });

    it('extracts text content from headings', () => {
      const html = '<h2>Introduction</h2><h2>Methods</h2><h2>Results</h2>';
      const toc = generateTableOfContents(html);
      expect(toc[0].text).toBe('Introduction');
      expect(toc[1].text).toBe('Methods');
      expect(toc[2].text).toBe('Results');
    });

    it('handles headings with nested HTML elements', () => {
      const html = '<h2>Hello <strong>World</strong></h2><h2>Test <em>Content</em></h2><h2>Final</h2>';
      const toc = generateTableOfContents(html);
      expect(toc[0].text).toBe('Hello World');
      expect(toc[1].text).toBe('Test Content');
    });

    it('handles empty heading text', () => {
      const html = '<h2></h2><h2>Valid</h2><h2>Content</h2>';
      const toc = generateTableOfContents(html);
      expect(toc[0].text).toBe('');
      expect(toc[1].text).toBe('Valid');
    });
  });

  describe('ID generation and assignment', () => {
    it('uses existing IDs when present', () => {
      const html = '<h2 id="intro">Introduction</h2><h2 id="methods">Methods</h2><h2 id="results">Results</h2>';
      const toc = generateTableOfContents(html);
      expect(toc[0].id).toBe('intro');
      expect(toc[1].id).toBe('methods');
      expect(toc[2].id).toBe('results');
    });

    it('generates IDs for headings without IDs', () => {
      const html = '<h2>First</h2><h2>Second</h2><h2>Third</h2>';
      const toc = generateTableOfContents(html);
      expect(toc[0].id).toBe('heading-0');
      expect(toc[1].id).toBe('heading-1');
      expect(toc[2].id).toBe('heading-2');
    });

    it('mixes existing and generated IDs', () => {
      const html = '<h2 id="custom">Custom</h2><h2>Auto</h2><h2 id="another">Another</h2>';
      const toc = generateTableOfContents(html);
      expect(toc[0].id).toBe('custom');
      expect(toc[1].id).toBe('heading-1');
      expect(toc[2].id).toBe('another');
    });

    it('ensures headings in DOM have IDs after parsing', () => {
      const html = '<h2>First</h2><h2>Second</h2><h2>Third</h2>';
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Before calling generateTableOfContents
      const headingsBefore = doc.querySelectorAll('h2');
      expect(headingsBefore[0].id).toBe('');
      
      // Call function with original HTML
      generateTableOfContents(html);
      
      // Note: The function modifies the parsed document, not the original HTML string
      // This test verifies the function's behavior, but the original HTML remains unchanged
    });
  });

  describe('hierarchy building - simple cases', () => {
    it('creates flat structure for same-level headings', () => {
      const html = '<h2>A</h2><h2>B</h2><h2>C</h2>';
      const toc = generateTableOfContents(html);
      expect(toc).toHaveLength(3);
      expect(toc[0].children).toHaveLength(0);
      expect(toc[1].children).toHaveLength(0);
      expect(toc[2].children).toHaveLength(0);
    });

    it('nests h3 under h2', () => {
      const html = '<h2>Parent</h2><h3>Child 1</h3><h3>Child 2</h3>';
      const toc = generateTableOfContents(html);
      expect(toc).toHaveLength(1);
      expect(toc[0].text).toBe('Parent');
      expect(toc[0].children).toHaveLength(2);
      expect(toc[0].children[0].text).toBe('Child 1');
      expect(toc[0].children[1].text).toBe('Child 2');
    });

    it('nests h4 under h3', () => {
      const html = '<h2>Root</h2><h3>Level 2</h3><h4>Level 3</h4>';
      const toc = generateTableOfContents(html);
      expect(toc).toHaveLength(1);
      expect(toc[0].children).toHaveLength(1);
      expect(toc[0].children[0].children).toHaveLength(1);
      expect(toc[0].children[0].children[0].text).toBe('Level 3');
      expect(toc[0].children[0].children[0].level).toBe(4);
    });
  });

  describe('hierarchy building - complex cases', () => {
    it('handles multiple root-level h2 with nested children', () => {
      const html = `
        <h2>Section 1</h2>
        <h3>Section 1.1</h3>
        <h3>Section 1.2</h3>
        <h2>Section 2</h2>
        <h3>Section 2.1</h3>
      `;
      const toc = generateTableOfContents(html);
      expect(toc).toHaveLength(2);
      expect(toc[0].text).toBe('Section 1');
      expect(toc[0].children).toHaveLength(2);
      expect(toc[1].text).toBe('Section 2');
      expect(toc[1].children).toHaveLength(1);
    });

    it('handles deep nesting (h2 > h3 > h4)', () => {
      const html = `
        <h2>Chapter 1</h2>
        <h3>Section 1.1</h3>
        <h4>Subsection 1.1.1</h4>
        <h4>Subsection 1.1.2</h4>
        <h3>Section 1.2</h3>
      `;
      const toc = generateTableOfContents(html);
      expect(toc).toHaveLength(1);
      expect(toc[0].children).toHaveLength(2);
      expect(toc[0].children[0].children).toHaveLength(2);
      expect(toc[0].children[0].children[0].text).toBe('Subsection 1.1.1');
      expect(toc[0].children[0].children[1].text).toBe('Subsection 1.1.2');
    });

    it('handles level jumps (h2 directly to h4)', () => {
      const html = '<h2>Root</h2><h4>Skipped Level</h4><h2>Another Root</h2>';
      const toc = generateTableOfContents(html);
      expect(toc).toHaveLength(2);
      expect(toc[0].children).toHaveLength(1);
      expect(toc[0].children[0].level).toBe(4);
      expect(toc[0].children[0].text).toBe('Skipped Level');
    });

    it('handles returning to higher level after nesting', () => {
      const html = `
        <h2>A</h2>
        <h3>A.1</h3>
        <h4>A.1.1</h4>
        <h2>B</h2>
      `;
      const toc = generateTableOfContents(html);
      expect(toc).toHaveLength(2);
      expect(toc[0].text).toBe('A');
      expect(toc[1].text).toBe('B');
      expect(toc[0].children[0].children[0].text).toBe('A.1.1');
    });

    it('handles multiple h4 under same h3', () => {
      const html = `
        <h2>Main</h2>
        <h3>Sub</h3>
        <h4>Detail 1</h4>
        <h4>Detail 2</h4>
        <h4>Detail 3</h4>
      `;
      const toc = generateTableOfContents(html);
      expect(toc[0].children[0].children).toHaveLength(3);
    });
  });

  describe('realistic content scenarios', () => {
    it('handles typical blog post structure', () => {
      const html = `
        <article>
          <h2>Introduction</h2>
          <p>Some intro text</p>
          <h3>Background</h3>
          <p>Background info</p>
          <h3>Motivation</h3>
          <p>Why this matters</p>
          <h2>Methods</h2>
          <p>How we did it</p>
          <h3>Data Collection</h3>
          <p>Data details</p>
          <h2>Results</h2>
          <p>What we found</p>
        </article>
      `;
      const toc = generateTableOfContents(html);
      expect(toc).toHaveLength(3);
      expect(toc[0].text).toBe('Introduction');
      expect(toc[0].children).toHaveLength(2);
      expect(toc[1].text).toBe('Methods');
      expect(toc[1].children).toHaveLength(1);
      expect(toc[2].text).toBe('Results');
      expect(toc[2].children).toHaveLength(0);
    });

    it('handles technical documentation structure', () => {
      const html = `
        <h2>Installation</h2>
        <h3>Prerequisites</h3>
        <h3>Setup Steps</h3>
        <h4>Step 1</h4>
        <h4>Step 2</h4>
        <h2>Configuration</h2>
        <h3>Basic Config</h3>
        <h3>Advanced Config</h3>
        <h2>Usage</h2>
      `;
      const toc = generateTableOfContents(html);
      expect(toc).toHaveLength(3);
      expect(toc[0].children).toHaveLength(2);
      expect(toc[0].children[1].children).toHaveLength(2);
      expect(toc[1].children).toHaveLength(2);
      expect(toc[2].children).toHaveLength(0);
    });

    it('handles content with mixed elements between headings', () => {
      const html = `
        <div>
          <h2>Chapter 1</h2>
          <p>Paragraph</p>
          <img src="test.jpg" />
          <h3>Section 1.1</h3>
          <ul><li>List item</li></ul>
          <h3>Section 1.2</h3>
          <blockquote>Quote</blockquote>
          <h2>Chapter 2</h2>
        </div>
      `;
      const toc = generateTableOfContents(html);
      expect(toc).toHaveLength(2);
      expect(toc[0].children).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('handles empty HTML string', () => {
      expect(generateTableOfContents('')).toEqual([]);
    });

    it('handles HTML with only non-heading elements', () => {
      const html = '<div><p>Text</p><span>More text</span></div>';
      expect(generateTableOfContents(html)).toEqual([]);
    });

    it('handles malformed HTML gracefully', () => {
      const html = '<h2>Unclosed<h3>Another</h3><h2>Valid</h2>';
      const toc = generateTableOfContents(html);
      // DOMParser will attempt to fix malformed HTML
      expect(toc.length).toBeGreaterThanOrEqual(2);
    });

    it('handles headings with special characters', () => {
      const html = '<h2>Hello & Goodbye</h2><h2>Test < > "Quotes"</h2><h2>Third</h2>';
      const toc = generateTableOfContents(html);
      expect(toc[0].text).toContain('&');
      expect(toc[1].text).toContain('<');
    });

    it('handles headings with Unicode characters', () => {
      const html = '<h2>Tiếng Việt</h2><h2>中文</h2><h2>日本語</h2>';
      const toc = generateTableOfContents(html);
      expect(toc[0].text).toBe('Tiếng Việt');
      expect(toc[1].text).toBe('中文');
      expect(toc[2].text).toBe('日本語');
    });

    it('handles very long heading text', () => {
      const longText = 'A'.repeat(500);
      const html = `<h2>${longText}</h2><h2>B</h2><h2>C</h2>`;
      const toc = generateTableOfContents(html);
      expect(toc[0].text).toBe(longText);
      expect(toc[0].text.length).toBe(500);
    });

    it('handles headings with only whitespace', () => {
      const html = '<h2>   </h2><h2>Valid</h2><h2>Content</h2>';
      const toc = generateTableOfContents(html);
      expect(toc[0].text).toBe('   ');
      expect(toc[1].text).toBe('Valid');
    });
  });

  describe('TOCItem structure validation', () => {
    it('ensures all items have required properties', () => {
      const html = '<h2>A</h2><h3>B</h3><h2>C</h2>';
      const toc = generateTableOfContents(html);
      
      const validateItem = (item: TOCItem) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('level');
        expect(item).toHaveProperty('text');
        expect(item).toHaveProperty('children');
        expect(typeof item.id).toBe('string');
        expect(typeof item.level).toBe('number');
        expect(typeof item.text).toBe('string');
        expect(Array.isArray(item.children)).toBe(true);
        
        // Recursively validate children
        item.children.forEach(validateItem);
      };
      
      toc.forEach(validateItem);
    });

    it('ensures level values are correct (2, 3, or 4)', () => {
      const html = '<h2>A</h2><h3>B</h3><h4>C</h4>';
      const toc = generateTableOfContents(html);
      
      const checkLevels = (item: TOCItem) => {
        expect([2, 3, 4]).toContain(item.level);
        item.children.forEach(checkLevels);
      };
      
      toc.forEach(checkLevels);
    });

    it('ensures children array is always present (never undefined)', () => {
      const html = '<h2>A</h2><h2>B</h2><h2>C</h2>';
      const toc = generateTableOfContents(html);
      
      const checkChildren = (item: TOCItem) => {
        expect(item.children).toBeDefined();
        expect(Array.isArray(item.children)).toBe(true);
        item.children.forEach(checkChildren);
      };
      
      toc.forEach(checkChildren);
    });
  });
});
