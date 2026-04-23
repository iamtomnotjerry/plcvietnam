/**
 * TableOfContents Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TableOfContents } from './TableOfContents';

describe('TableOfContents', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
    
    // Mock scrollTo
    window.scrollTo = vi.fn();
  });
  
  it('renders table of contents heading', () => {
    const content = `
      <h2 id="section-1">Section 1</h2>
      <h2 id="section-2">Section 2</h2>
      <h2 id="section-3">Section 3</h2>
    `;
    
    render(<TableOfContents content={content} />);
    
    expect(screen.getByText('Mục lục')).toBeInTheDocument();
  });
  
  it('renders all TOC items', () => {
    const content = `
      <h2 id="intro">Introduction</h2>
      <h2 id="methods">Methods</h2>
      <h2 id="results">Results</h2>
    `;
    
    render(<TableOfContents content={content} />);
    
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Methods')).toBeInTheDocument();
    expect(screen.getByText('Results')).toBeInTheDocument();
  });
  
  it('renders nested TOC items', () => {
    const content = `
      <h2 id="section-1">Section 1</h2>
      <h3 id="section-1-1">Section 1.1</h3>
      <h3 id="section-1-2">Section 1.2</h3>
      <h2 id="section-2">Section 2</h2>
    `;
    
    render(<TableOfContents content={content} />);
    
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 1.1')).toBeInTheDocument();
    expect(screen.getByText('Section 1.2')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
  });
  
  it('does not render when content has fewer than 3 headings', () => {
    const content = `
      <h2 id="section-1">Section 1</h2>
      <h2 id="section-2">Section 2</h2>
    `;
    
    const { container } = render(<TableOfContents content={content} />);
    
    expect(container.firstChild).toBeNull();
  });
  
  it('renders TOC items as links with correct href', () => {
    const content = `
      <h2 id="intro">Introduction</h2>
      <h2 id="methods">Methods</h2>
      <h2 id="results">Results</h2>
    `;
    
    render(<TableOfContents content={content} />);
    
    const introLink = screen.getByText('Introduction').closest('a');
    expect(introLink).toHaveAttribute('href', '#intro');
    
    const methodsLink = screen.getByText('Methods').closest('a');
    expect(methodsLink).toHaveAttribute('href', '#methods');
  });
  
  it('handles click on TOC item', () => {
    const content = `
      <h2 id="intro">Introduction</h2>
      <h2 id="methods">Methods</h2>
      <h2 id="results">Results</h2>
    `;
    
    // Create mock heading element
    const mockHeading = document.createElement('h2');
    mockHeading.id = 'intro';
    document.body.appendChild(mockHeading);
    
    render(<TableOfContents content={content} />);
    
    const introLink = screen.getByText('Introduction');
    fireEvent.click(introLink);
    
    expect(window.scrollTo).toHaveBeenCalled();
    
    // Cleanup
    document.body.removeChild(mockHeading);
  });
  
  it('applies sticky positioning', () => {
    const content = `
      <h2 id="section-1">Section 1</h2>
      <h2 id="section-2">Section 2</h2>
      <h2 id="section-3">Section 3</h2>
    `;
    
    const { container } = render(<TableOfContents content={content} />);
    
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('sticky', 'top-24');
  });
  
  it('applies custom className', () => {
    const content = `
      <h2 id="section-1">Section 1</h2>
      <h2 id="section-2">Section 2</h2>
      <h2 id="section-3">Section 3</h2>
    `;
    
    const { container } = render(
      <TableOfContents content={content} className="custom-class" />
    );
    
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-class');
  });
  
  it('handles empty content', () => {
    const { container } = render(<TableOfContents content="" />);
    
    expect(container.firstChild).toBeNull();
  });
  
  it('handles content with only paragraphs', () => {
    const content = `
      <p>Paragraph 1</p>
      <p>Paragraph 2</p>
      <p>Paragraph 3</p>
    `;
    
    const { container } = render(<TableOfContents content={content} />);
    
    expect(container.firstChild).toBeNull();
  });
});
