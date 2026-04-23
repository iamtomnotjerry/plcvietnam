/**
 * PostContent Component Tests
 * Unit tests for PostContent component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PostContent } from './PostContent';

describe('PostContent', () => {
  it('renders HTML content', () => {
    const content = '<p>This is test content</p>';
    render(<PostContent content={content} />);
    
    expect(screen.getByText('This is test content')).toBeInTheDocument();
  });
  
  it('renders headings with proper structure', () => {
    const content = `
      <h2>Main Heading</h2>
      <p>Paragraph text</p>
      <h3>Subheading</h3>
    `;
    render(<PostContent content={content} />);
    
    expect(screen.getByText('Main Heading')).toBeInTheDocument();
    expect(screen.getByText('Subheading')).toBeInTheDocument();
  });
  
  it('renders images in content', () => {
    const content = '<img src="/test.jpg" alt="Test image" />';
    const { container } = render(<PostContent content={content} />);
    
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test.jpg');
    expect(img).toHaveAttribute('alt', 'Test image');
  });
  
  it('renders YouTube iframes', () => {
    const content = '<iframe src="https://www.youtube.com/embed/test123"></iframe>';
    const { container } = render(<PostContent content={content} />);
    
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/test123');
  });
  
  it('renders lists correctly', () => {
    const content = `
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    `;
    render(<PostContent content={content} />);
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
  
  it('renders code blocks', () => {
    const content = '<pre><code>const x = 10;</code></pre>';
    render(<PostContent content={content} />);
    
    expect(screen.getByText('const x = 10;')).toBeInTheDocument();
  });
  
  it('renders blockquotes', () => {
    const content = '<blockquote>This is a quote</blockquote>';
    render(<PostContent content={content} />);
    
    expect(screen.getByText('This is a quote')).toBeInTheDocument();
  });
  
  it('renders links with proper attributes', () => {
    const content = '<a href="https://example.com">Link text</a>';
    render(<PostContent content={content} />);
    
    const link = screen.getByText('Link text');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });
  
  it('applies custom className', () => {
    const content = '<p>Test</p>';
    const { container } = render(<PostContent content={content} className="custom-class" />);
    
    const contentDiv = container.firstChild;
    expect(contentDiv).toHaveClass('custom-class');
  });
  
  it('applies prose styles for typography', () => {
    const content = '<p>Test</p>';
    const { container } = render(<PostContent content={content} />);
    
    const contentDiv = container.firstChild;
    expect(contentDiv).toHaveClass('prose');
  });
  
  it('handles empty content gracefully', () => {
    const content = '';
    const { container } = render(<PostContent content={content} />);
    
    expect(container.firstChild).toBeInTheDocument();
  });
  
  it('handles complex nested HTML', () => {
    const content = `
      <div>
        <h2>Title</h2>
        <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
        <ul>
          <li>List item with <a href="#">link</a></li>
        </ul>
      </div>
    `;
    render(<PostContent content={content} />);
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
  });
});
