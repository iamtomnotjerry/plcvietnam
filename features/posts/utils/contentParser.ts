/**
 * Content Parser Utility
 * 
 * Parses HTML content to extract structured information like table of contents.
 * Used for generating navigation aids and improving content accessibility.
 * 
 * @module features/posts/utils/contentParser
 */

/**
 * Represents an item in the table of contents
 */
export interface TOCItem {
  /** Unique identifier for the heading (used for anchor links) */
  id: string;
  /** Heading level (2, 3, or 4) */
  level: number;
  /** Text content of the heading */
  text: string;
  /** Child headings nested under this heading */
  children: TOCItem[];
}

/**
 * Generate a hierarchical table of contents from HTML content
 * 
 * Algorithm:
 * 1. Parse HTML content using DOMParser
 * 2. Extract all h2, h3, h4 headings
 * 3. Return empty array if fewer than 3 headings
 * 4. Build hierarchical tree structure preserving heading levels
 * 5. Ensure all headings have IDs for anchor links
 * 
 * The hierarchy is built using a stack-based approach:
 * - When encountering a heading at the same or higher level, pop from stack
 * - If stack is empty, add to root items
 * - Otherwise, add as child of current stack top
 * - Push current item to stack
 * 
 * @param htmlContent - The HTML content to parse
 * @returns Array of top-level TOC items with nested children, or empty array if < 3 headings
 * 
 * @example
 * ```typescript
 * const html = `
 *   <h2>Introduction</h2>
 *   <h3>Background</h3>
 *   <h2>Methods</h2>
 * `;
 * const toc = generateTableOfContents(html);
 * // Returns:
 * // [
 * //   { id: 'heading-0', level: 2, text: 'Introduction', children: [
 * //     { id: 'heading-1', level: 3, text: 'Background', children: [] }
 * //   ]},
 * //   { id: 'heading-2', level: 2, text: 'Methods', children: [] }
 * // ]
 * ```
 */
export function generateTableOfContents(htmlContent: string): TOCItem[] {
  // Parse HTML content
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const headings = doc.querySelectorAll('h2, h3, h4');
  
  // Return empty array if fewer than 3 headings
  if (headings.length < 3) {
    return [];
  }
  
  const items: TOCItem[] = [];
  const stack: TOCItem[] = [];
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1));
    const text = heading.textContent || '';
    const id = heading.id || `heading-${index}`;
    
    // Ensure heading has ID for anchor links
    if (!heading.id) {
      heading.id = id;
    }
    
    const item: TOCItem = { id, level, text, children: [] };
    
    // Find parent in stack
    // Pop items from stack until we find a heading with lower level (potential parent)
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }
    
    // If stack is empty, this is a root-level item
    if (stack.length === 0) {
      items.push(item);
    } else {
      // Otherwise, add as child of current stack top
      stack[stack.length - 1].children.push(item);
    }
    
    // Push current item to stack for potential children
    stack.push(item);
  });
  
  return items;
}
