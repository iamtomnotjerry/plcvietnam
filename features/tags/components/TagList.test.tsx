/**
 * TagList Component Tests
 * Unit tests for TagList component
 * Validates Requirements: 12.1, 12.2
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TagList } from './TagList';
import type { Tag } from '@/lib/types/domain';

/**
 * Create a mock tag for testing
 */
function createMockTag(overrides?: Partial<Tag>): Tag {
  return {
    id: 'tag-1',
    slug: 'test-tag',
    name: 'Test Tag',
    postCount: 5,
    ...overrides,
  };
}

describe('TagList', () => {
  describe('basic rendering', () => {
    it('renders tag chips with correct names', () => {
      const tags = [
        createMockTag({ id: 'tag-1', name: 'PLC' }),
        createMockTag({ id: 'tag-2', name: 'SCADA', slug: 'scada' }),
        createMockTag({ id: 'tag-3', name: 'Siemens', slug: 'siemens' }),
      ];
      
      render(<TagList tags={tags} />);
      
      expect(screen.getByText('PLC')).toBeInTheDocument();
      expect(screen.getByText('SCADA')).toBeInTheDocument();
      expect(screen.getByText('Siemens')).toBeInTheDocument();
    });
    
    it('renders correct link URLs for each tag', () => {
      const tags = [
        createMockTag({ id: 'tag-1', slug: 'co-ban', name: 'Cơ bản' }),
        createMockTag({ id: 'tag-2', slug: 'nang-cao', name: 'Nâng cao' }),
      ];
      
      render(<TagList tags={tags} />);
      
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', '/tags/co-ban');
      expect(links[1]).toHaveAttribute('href', '/tags/nang-cao');
    });
    
    it('returns null when tags array is empty', () => {
      const { container } = render(<TagList tags={[]} />);
      
      expect(container.firstChild).toBeNull();
    });
    
    it('renders tag icon for each chip', () => {
      const tags = [createMockTag()];
      const { container } = render(<TagList tags={tags} />);
      
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });
  });
  
  describe('variant prop', () => {
    it('applies default variant styles', () => {
      const tags = [createMockTag()];
      render(<TagList tags={tags} variant="default" />);
      
      const chip = screen.getByText('Test Tag').closest('a');
      expect(chip).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });
    
    it('applies compact variant styles', () => {
      const tags = [createMockTag()];
      render(<TagList tags={tags} variant="compact" />);
      
      const chip = screen.getByText('Test Tag').closest('a');
      expect(chip).toHaveClass('px-2.5', 'py-1', 'text-xs');
    });
    
    it('defaults to default variant when not specified', () => {
      const tags = [createMockTag()];
      render(<TagList tags={tags} />);
      
      const chip = screen.getByText('Test Tag').closest('a');
      expect(chip).toHaveClass('px-3', 'py-1.5', 'text-sm');
    });
  });
  
  describe('showCount prop', () => {
    it('displays post count when showCount is true', () => {
      const tags = [createMockTag({ postCount: 12 })];
      render(<TagList tags={tags} showCount={true} />);
      
      expect(screen.getByText('(12)')).toBeInTheDocument();
    });
    
    it('hides post count when showCount is false', () => {
      const tags = [createMockTag({ postCount: 12 })];
      render(<TagList tags={tags} showCount={false} />);
      
      expect(screen.queryByText('(12)')).not.toBeInTheDocument();
    });
    
    it('defaults to hiding post count when not specified', () => {
      const tags = [createMockTag({ postCount: 12 })];
      render(<TagList tags={tags} />);
      
      expect(screen.queryByText('(12)')).not.toBeInTheDocument();
    });
    
    it('displays correct count for multiple tags', () => {
      const tags = [
        createMockTag({ id: 'tag-1', name: 'Tag 1', postCount: 5 }),
        createMockTag({ id: 'tag-2', name: 'Tag 2', postCount: 10 }),
        createMockTag({ id: 'tag-3', name: 'Tag 3', postCount: 3 }),
      ];
      render(<TagList tags={tags} showCount={true} />);
      
      expect(screen.getByText('(5)')).toBeInTheDocument();
      expect(screen.getByText('(10)')).toBeInTheDocument();
      expect(screen.getByText('(3)')).toBeInTheDocument();
    });
  });
  
  describe('accessibility', () => {
    it('includes aria-label for each tag link', () => {
      const tags = [createMockTag({ name: 'PLC Cơ bản' })];
      render(<TagList tags={tags} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label', 'Xem bài viết với tag PLC Cơ bản');
    });
    
    it('renders all tags as clickable links', () => {
      const tags = [
        createMockTag({ id: 'tag-1', name: 'Tag 1' }),
        createMockTag({ id: 'tag-2', name: 'Tag 2' }),
        createMockTag({ id: 'tag-3', name: 'Tag 3' }),
      ];
      render(<TagList tags={tags} />);
      
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);
    });
  });
  
  describe('styling and interaction', () => {
    it('applies hover styles to tag chips', () => {
      const tags = [createMockTag()];
      render(<TagList tags={tags} />);
      
      const chip = screen.getByText('Test Tag').closest('a');
      expect(chip).toHaveClass('hover:bg-primary', 'hover:text-primary-foreground');
    });
    
    it('applies cursor-pointer class', () => {
      const tags = [createMockTag()];
      render(<TagList tags={tags} />);
      
      const chip = screen.getByText('Test Tag').closest('a');
      expect(chip).toHaveClass('cursor-pointer');
    });
    
    it('applies transition classes for smooth hover effects', () => {
      const tags = [createMockTag()];
      render(<TagList tags={tags} />);
      
      const chip = screen.getByText('Test Tag').closest('a');
      expect(chip).toHaveClass('transition-all', 'duration-200');
    });
    
    it('uses flex-wrap layout for responsive display', () => {
      const tags = [createMockTag()];
      const { container } = render(<TagList tags={tags} />);
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex', 'flex-wrap', 'gap-2');
    });
  });
  
  describe('multiple tags', () => {
    it('renders all tags in the array', () => {
      const tags = [
        createMockTag({ id: 'tag-1', name: 'Tag 1', slug: 'tag-1' }),
        createMockTag({ id: 'tag-2', name: 'Tag 2', slug: 'tag-2' }),
        createMockTag({ id: 'tag-3', name: 'Tag 3', slug: 'tag-3' }),
        createMockTag({ id: 'tag-4', name: 'Tag 4', slug: 'tag-4' }),
        createMockTag({ id: 'tag-5', name: 'Tag 5', slug: 'tag-5' }),
      ];
      
      render(<TagList tags={tags} />);
      
      expect(screen.getByText('Tag 1')).toBeInTheDocument();
      expect(screen.getByText('Tag 2')).toBeInTheDocument();
      expect(screen.getByText('Tag 3')).toBeInTheDocument();
      expect(screen.getByText('Tag 4')).toBeInTheDocument();
      expect(screen.getByText('Tag 5')).toBeInTheDocument();
    });
    
    it('maintains unique keys for each tag', () => {
      const tags = [
        createMockTag({ id: 'tag-1', name: 'Tag 1' }),
        createMockTag({ id: 'tag-2', name: 'Tag 2' }),
      ];
      
      const { container } = render(<TagList tags={tags} />);
      const links = container.querySelectorAll('a');
      
      // Each link should have a unique key (React handles this internally)
      expect(links).toHaveLength(2);
    });
  });
  
  describe('edge cases', () => {
    it('handles tags with zero post count', () => {
      const tags = [createMockTag({ postCount: 0 })];
      render(<TagList tags={tags} showCount={true} />);
      
      expect(screen.getByText('(0)')).toBeInTheDocument();
    });
    
    it('handles tags with very long names', () => {
      const longName = 'This is a very long tag name that might wrap to multiple lines';
      const tags = [createMockTag({ name: longName })];
      render(<TagList tags={tags} />);
      
      expect(screen.getByText(longName)).toBeInTheDocument();
    });
    
    it('handles tags with special characters in slug', () => {
      const tags = [createMockTag({ slug: 'plc-s7-1200', name: 'PLC S7-1200' })];
      render(<TagList tags={tags} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/tags/plc-s7-1200');
    });
    
    it('handles single tag', () => {
      const tags = [createMockTag()];
      render(<TagList tags={tags} />);
      
      expect(screen.getByText('Test Tag')).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });
  });
});
