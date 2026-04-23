/**
 * Property-Based Tests for Table of Contents Generation
 * Feature: automation-blog, Property 3: Table of Contents Hierarchy Preservation
 * 
 * **Validates: Requirements 3.4**
 * 
 * For any HTML content with heading elements (h2, h3, h4), the generated table of contents 
 * SHALL preserve the hierarchical structure where each heading's level determines its nesting depth, 
 * and SHALL only be generated when 3 or more headings exist.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { generateTableOfContents, TOCItem } from '../contentParser';
import { JSDOM } from 'jsdom';

// Setup DOM environment for tests
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.DOMParser = dom.window.DOMParser as any;

/**
 * Generator for valid HTML-safe text content
 * Avoids characters that would be interpreted as HTML tags or entities
 * Must have at least one non-whitespace character
 */
const htmlSafeTextArbitrary = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => {
    const trimmed = s.trim();
    return trimmed.length > 0 && 
           !s.includes('<') && 
           !s.includes('>') &&
           !s.includes('&'); // Avoid HTML entities being decoded by DOMParser
  });

/**
 * Generator for valid HTML ID attributes
 * IDs should be valid HTML identifiers suitable for anchor links
 * - Must not be empty or whitespace-only
 * - Should not contain quotes, spaces, or special HTML characters
 * - Should be URL-safe for anchor links
 */
const htmlIdArbitrary = fc.string({ minLength: 1, maxLength: 20 })
  .filter(s => {
    const trimmed = s.trim();
    return trimmed.length > 0 && 
           trimmed === s && // No leading/trailing whitespace
           !s.includes('"') && 
           !s.includes("'") && 
           !s.includes('<') && 
           !s.includes('>') && 
           !s.includes(' ') &&
           !s.includes('\n') &&
           !s.includes('\t') &&
           !s.includes('&'); // Avoid HTML entities being decoded by DOMParser
  });

/**
 * Generator for heading elements with controlled structure
 */
const headingArbitrary = fc.record({
  level: fc.constantFrom(2, 3, 4),
  text: htmlSafeTextArbitrary,
  id: fc.option(htmlIdArbitrary, { nil: undefined })
});

/**
 * Generator for arrays of headings with varying structures
 */
const headingsArrayArbitrary = fc.array(headingArbitrary, { minLength: 0, maxLength: 20 });

/**
 * Helper function to convert heading objects to HTML
 */
function headingsToHTML(headings: Array<{ level: number; text: string; id?: string }>): string {
  return headings
    .map(h => {
      const idAttr = h.id ? ` id="${h.id}"` : '';
      return `<h${h.level}${idAttr}>${h.text}</h${h.level}>`;
    })
    .join('\n');
}

/**
 * Helper function to flatten TOC tree for easier verification
 */
function flattenTOC(items: TOCItem[]): TOCItem[] {
  const result: TOCItem[] = [];
  
  function traverse(items: TOCItem[]) {
    for (const item of items) {
      result.push(item);
      if (item.children.length > 0) {
        traverse(item.children);
      }
    }
  }
  
  traverse(items);
  return result;
}

/**
 * Helper function to count total headings in TOC tree
 */
function countTOCItems(items: TOCItem[]): number {
  let count = 0;
  
  function traverse(items: TOCItem[]) {
    for (const item of items) {
      count++;
      if (item.children.length > 0) {
        traverse(item.children);
      }
    }
  }
  
  traverse(items);
  return count;
}

describe('Property: Table of Contents Hierarchy Preservation', () => {
  it('should return empty array when fewer than 3 headings exist', () => {
    fc.assert(
      fc.property(
        fc.array(headingArbitrary, { minLength: 0, maxLength: 2 }),
        (headings) => {
          const html = headingsToHTML(headings);
          const toc = generateTableOfContents(html);
          
          // With < 3 headings, TOC should be empty
          expect(toc).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate TOC when 3 or more headings exist', () => {
    fc.assert(
      fc.property(
        fc.array(headingArbitrary, { minLength: 3, maxLength: 20 }),
        (headings) => {
          const html = headingsToHTML(headings);
          const toc = generateTableOfContents(html);
          
          // With >= 3 headings, TOC should not be empty
          expect(toc.length).toBeGreaterThan(0);
          
          // Total items in TOC should equal number of headings
          const totalItems = countTOCItems(toc);
          expect(totalItems).toBe(headings.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve all heading text content', () => {
    fc.assert(
      fc.property(
        fc.array(headingArbitrary, { minLength: 3, maxLength: 20 }),
        (headings) => {
          const html = headingsToHTML(headings);
          const toc = generateTableOfContents(html);
          
          // Flatten TOC to get all items
          const flatTOC = flattenTOC(toc);
          
          // Extract all text values from TOC
          const tocTexts = flatTOC.map(item => item.text).sort();
          const headingTexts = headings.map(h => h.text).sort();
          
          // All heading texts should be preserved in TOC
          expect(tocTexts).toEqual(headingTexts);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve heading levels correctly', () => {
    fc.assert(
      fc.property(
        fc.array(headingArbitrary, { minLength: 3, maxLength: 20 }),
        (headings) => {
          const html = headingsToHTML(headings);
          const toc = generateTableOfContents(html);
          
          const flatTOC = flattenTOC(toc);
          
          // Each TOC item should have the correct level
          // Match by position since text might not be unique
          expect(flatTOC.length).toBe(headings.length);
          
          for (let i = 0; i < flatTOC.length; i++) {
            expect(flatTOC[i].level).toBe(headings[i].level);
            expect(flatTOC[i].text).toBe(headings[i].text);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate IDs for headings without IDs', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            level: fc.constantFrom(2, 3, 4),
            text: fc.string({ minLength: 1, maxLength: 50 })
            // No id field - should be auto-generated
          }),
          { minLength: 3, maxLength: 20 }
        ),
        (headings) => {
          const html = headingsToHTML(headings);
          const toc = generateTableOfContents(html);
          
          const flatTOC = flattenTOC(toc);
          
          // All TOC items should have IDs
          flatTOC.forEach(item => {
            expect(item.id).toBeDefined();
            expect(item.id.length).toBeGreaterThan(0);
          });
          
          // All IDs should be unique
          const ids = flatTOC.map(item => item.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve existing heading IDs', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            level: fc.constantFrom(2, 3, 4),
            text: htmlSafeTextArbitrary,
            id: htmlIdArbitrary
          }),
          { minLength: 3, maxLength: 20 }
        ),
        (headings) => {
          const html = headingsToHTML(headings);
          const toc = generateTableOfContents(html);
          
          const flatTOC = flattenTOC(toc);
          
          // Each TOC item should preserve the original ID
          // Match by position since text might not be unique
          expect(flatTOC.length).toBe(headings.length);
          
          for (let i = 0; i < flatTOC.length; i++) {
            expect(flatTOC[i].id).toBe(headings[i].id);
            expect(flatTOC[i].text).toBe(headings[i].text);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create proper parent-child relationships for nested headings', () => {
    fc.assert(
      fc.property(
        fc.array(headingArbitrary, { minLength: 3, maxLength: 20 }),
        (headings) => {
          const html = headingsToHTML(headings);
          const toc = generateTableOfContents(html);
          
          // Verify hierarchy: children should have higher level than parent
          function verifyHierarchy(items: TOCItem[], parentLevel: number = 1) {
            for (const item of items) {
              // Item level should be greater than parent level
              expect(item.level).toBeGreaterThan(parentLevel);
              
              // Recursively verify children
              if (item.children.length > 0) {
                verifyHierarchy(item.children, item.level);
              }
            }
          }
          
          verifyHierarchy(toc);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle flat heading structures (all same level)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(2, 3, 4),
        fc.array(htmlSafeTextArbitrary, { minLength: 3, maxLength: 20 }),
        (level, texts) => {
          const headings = texts.map(text => ({ level, text }));
          const html = headingsToHTML(headings);
          const toc = generateTableOfContents(html);
          
          // All headings at same level should be root items (no nesting)
          expect(toc.length).toBe(headings.length);
          
          // None should have children
          toc.forEach(item => {
            expect(item.children).toEqual([]);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle strictly nested heading structures (h2 > h3 > h4)', () => {
    fc.assert(
      fc.property(
        fc.array(htmlSafeTextArbitrary, { minLength: 3, maxLength: 3 }),
        (texts) => {
          // Create strictly nested structure: h2 > h3 > h4
          const headings = [
            { level: 2, text: texts[0] },
            { level: 3, text: texts[1] },
            { level: 4, text: texts[2] }
          ];
          const html = headingsToHTML(headings);
          const toc = generateTableOfContents(html);
          
          // Should have 1 root item (h2)
          expect(toc.length).toBe(1);
          expect(toc[0].level).toBe(2);
          expect(toc[0].text).toBe(texts[0]);
          
          // h2 should have 1 child (h3)
          expect(toc[0].children.length).toBe(1);
          expect(toc[0].children[0].level).toBe(3);
          expect(toc[0].children[0].text).toBe(texts[1]);
          
          // h3 should have 1 child (h4)
          expect(toc[0].children[0].children.length).toBe(1);
          expect(toc[0].children[0].children[0].level).toBe(4);
          expect(toc[0].children[0].children[0].text).toBe(texts[2]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle mixed heading structures correctly', () => {
    fc.assert(
      fc.property(
        fc.array(htmlSafeTextArbitrary, { minLength: 5, maxLength: 5 }),
        (texts) => {
          // Create mixed structure: h2, h3, h2, h3, h4
          const headings = [
            { level: 2, text: texts[0] },
            { level: 3, text: texts[1] },
            { level: 2, text: texts[2] },
            { level: 3, text: texts[3] },
            { level: 4, text: texts[4] }
          ];
          const html = headingsToHTML(headings);
          const toc = generateTableOfContents(html);
          
          // Should have 2 root items (both h2s)
          expect(toc.length).toBe(2);
          
          // First h2 should have 1 child (first h3)
          expect(toc[0].level).toBe(2);
          expect(toc[0].children.length).toBe(1);
          expect(toc[0].children[0].level).toBe(3);
          
          // Second h2 should have 1 child (second h3)
          expect(toc[1].level).toBe(2);
          expect(toc[1].children.length).toBe(1);
          expect(toc[1].children[0].level).toBe(3);
          
          // Second h3 should have 1 child (h4)
          expect(toc[1].children[0].children.length).toBe(1);
          expect(toc[1].children[0].children[0].level).toBe(4);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle heading level jumps (h2 to h4 without h3)', () => {
    fc.assert(
      fc.property(
        fc.array(htmlSafeTextArbitrary, { minLength: 3, maxLength: 3 }),
        (texts) => {
          // Create structure with level jump: h2, h4, h2
          const headings = [
            { level: 2, text: texts[0] },
            { level: 4, text: texts[1] },
            { level: 2, text: texts[2] }
          ];
          const html = headingsToHTML(headings);
          const toc = generateTableOfContents(html);
          
          // Should have 2 root items (both h2s)
          expect(toc.length).toBe(2);
          
          // First h2 should have h4 as direct child (level jump)
          expect(toc[0].level).toBe(2);
          expect(toc[0].children.length).toBe(1);
          expect(toc[0].children[0].level).toBe(4);
          
          // Second h2 should have no children
          expect(toc[1].level).toBe(2);
          expect(toc[1].children.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain heading order in the TOC', () => {
    fc.assert(
      fc.property(
        fc.array(headingArbitrary, { minLength: 3, maxLength: 20 }),
        (headings) => {
          const html = headingsToHTML(headings);
          const toc = generateTableOfContents(html);
          
          const flatTOC = flattenTOC(toc);
          
          // The order of headings in flattened TOC should match original order
          // (when traversed depth-first)
          expect(flatTOC.length).toBe(headings.length);
          
          // Verify each heading appears in the same relative order
          for (let i = 0; i < headings.length; i++) {
            expect(flatTOC[i].text).toBe(headings[i].text);
            expect(flatTOC[i].level).toBe(headings[i].level);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle HTML content with non-heading elements', () => {
    fc.assert(
      fc.property(
        fc.array(headingArbitrary, { minLength: 3, maxLength: 10 }),
        fc.array(fc.string(), { minLength: 0, maxLength: 10 }),
        (headings, paragraphs) => {
          // Interleave headings with paragraph elements
          let html = '';
          for (let i = 0; i < headings.length; i++) {
            html += headingsToHTML([headings[i]]);
            if (i < paragraphs.length) {
              html += `<p>${paragraphs[i]}</p>`;
            }
          }
          
          const toc = generateTableOfContents(html);
          
          // TOC should only include headings, not paragraphs
          const totalItems = countTOCItems(toc);
          expect(totalItems).toBe(headings.length);
          
          // Verify all heading texts are present
          const flatTOC = flattenTOC(toc);
          const tocTexts = flatTOC.map(item => item.text).sort();
          const headingTexts = headings.map(h => h.text).sort();
          expect(tocTexts).toEqual(headingTexts);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should ignore h1, h5, h6 headings (only process h2, h3, h4)', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            level: fc.constantFrom(1, 2, 3, 4, 5, 6),
            text: fc.string({ minLength: 1, maxLength: 50 })
          }),
          { minLength: 5, maxLength: 20 }
        ),
        (headings) => {
          const html = headingsToHTML(headings);
          const toc = generateTableOfContents(html);
          
          // Count only h2, h3, h4 headings
          const validHeadings = headings.filter(h => h.level >= 2 && h.level <= 4);
          
          if (validHeadings.length < 3) {
            // Should return empty if < 3 valid headings
            expect(toc).toEqual([]);
          } else {
            // Should only include h2, h3, h4 headings
            const totalItems = countTOCItems(toc);
            expect(totalItems).toBe(validHeadings.length);
            
            const flatTOC = flattenTOC(toc);
            flatTOC.forEach(item => {
              expect(item.level).toBeGreaterThanOrEqual(2);
              expect(item.level).toBeLessThanOrEqual(4);
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce consistent results for the same input', () => {
    fc.assert(
      fc.property(
        fc.array(headingArbitrary, { minLength: 0, maxLength: 20 }),
        (headings) => {
          const html = headingsToHTML(headings);
          
          const toc1 = generateTableOfContents(html);
          const toc2 = generateTableOfContents(html);
          
          // Same input should always produce same output (determinism)
          expect(toc1).toEqual(toc2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty HTML content', () => {
    const toc = generateTableOfContents('');
    expect(toc).toEqual([]);
  });

  it('should handle HTML with only whitespace', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('   ', '\n\n', '\t\t', '  \n  \t  '),
        (whitespace) => {
          const toc = generateTableOfContents(whitespace);
          expect(toc).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle headings with empty text content', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            level: fc.constantFrom(2, 3, 4),
            text: fc.constantFrom('', '   ', '\n')
          }),
          { minLength: 3, maxLength: 10 }
        ),
        (headings) => {
          const html = headingsToHTML(headings);
          const toc = generateTableOfContents(html);
          
          // Should still generate TOC structure even with empty text
          const totalItems = countTOCItems(toc);
          expect(totalItems).toBe(headings.length);
          
          // Each item should have empty or whitespace text
          const flatTOC = flattenTOC(toc);
          flatTOC.forEach(item => {
            expect(item.text.trim()).toBe('');
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
