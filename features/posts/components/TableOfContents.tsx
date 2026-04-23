/**
 * TableOfContents Component
 * Display hierarchical table of contents for post navigation
 * Validates Requirements: 3.4
 */

'use client';

import { useEffect, useState } from 'react';
import { generateTableOfContents, TOCItem } from '../utils/contentParser';

export interface TableOfContentsProps {
  /**
   * HTML content to generate TOC from
   */
  content: string;
  
  /**
   * Optional class name for styling
   */
  className?: string;
}

/**
 * TableOfContents Component
 * 
 * Generates and displays a hierarchical table of contents from post content.
 * Only displays if content has 3 or more headings (h2, h3, h4).
 * 
 * Features:
 * - Auto-generated from heading structure
 * - Smooth scroll to sections
 * - Highlights active section on scroll
 * - Sticky positioning for easy navigation
 * 
 * Requirements:
 * - 3.4: Display table of contents for posts with more than 3 headings
 */
export function TableOfContents({ content, className = '' }: TableOfContentsProps) {
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  
  useEffect(() => {
    // Generate TOC from content
    const tocItems = generateTableOfContents(content);
    setToc(tocItems);
    
    // Set up intersection observer for active section highlighting
    const headingElements = document.querySelectorAll('h2, h3, h4');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );
    
    headingElements.forEach((element) => {
      if (element.id) {
        observer.observe(element);
      }
    });
    
    return () => {
      headingElements.forEach((element) => {
        if (element.id) {
          observer.unobserve(element);
        }
      });
    };
  }, [content]);
  
  /**
   * Handle click on TOC item - smooth scroll to section
   */
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };
  
  /**
   * Render TOC item and its children recursively
   */
  const renderTOCItem = (item: TOCItem) => {
    const isActive = activeId === item.id;
    const indent = item.level === 2 ? 'pl-0' : item.level === 3 ? 'pl-4' : 'pl-8';
    
    return (
      <li key={item.id} className={indent}>
        <a
          href={`#${item.id}`}
          onClick={(e) => handleClick(e, item.id)}
          className={`
            block py-1.5 text-sm
            transition-colors duration-200
            hover:text-primary
            ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}
          `}
        >
          {item.text}
        </a>
        
        {/* Render children recursively */}
        {item.children.length > 0 && (
          <ul className="space-y-1">
            {item.children.map(renderTOCItem)}
          </ul>
        )}
      </li>
    );
  };
  
  // Don't render if TOC is empty (< 3 headings)
  if (toc.length === 0) {
    return null;
  }
  
  return (
    <nav
      className={`
        sticky top-24
        bg-card border border-border rounded-lg
        p-6
        ${className}
      `}
      aria-label="Table of contents"
    >
      <h2 className="text-lg font-semibold text-card-foreground mb-4">
        Mục lục
      </h2>
      
      <ul className="space-y-1">
        {toc.map(renderTOCItem)}
      </ul>
    </nav>
  );
}
