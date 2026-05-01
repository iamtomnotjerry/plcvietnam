/**
 * Unit tests for NavigationNode component
 * Validates Requirements: 1.2, 1.3, 1.4
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NavigationNode } from './NavigationNode';
import type { NavigationNode as NavigationNodeType } from '@/lib/types/domain';

// Mock Next.js navigation
const mockUsePathname = vi.fn(() => '/fields/plc/basics/intro-plc');

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// Sample navigation nodes
const fieldNode: NavigationNodeType = {
  id: 'field-1',
  type: 'field',
  label: 'PLC',
  slug: 'plc',
  url: '/fields/plc',
  postCount: 10,
  children: [
    {
      id: 'category-1',
      type: 'category',
      label: 'Basics',
      slug: 'basics',
      url: '/fields/plc/basics',
      postCount: 5,
      children: [
        {
          id: 'post-1',
          type: 'post',
          label: 'Introduction to PLC',
          slug: 'intro-plc',
          url: '/fields/plc/basics/intro-plc',
        },
      ],
    },
  ],
};

const categoryNode: NavigationNodeType = {
  id: 'category-1',
  type: 'category',
  label: 'Basics',
  slug: 'basics',
  url: '/fields/plc/basics',
  postCount: 5,
  children: [
    {
      id: 'post-1',
      type: 'post',
      label: 'Introduction to PLC',
      slug: 'intro-plc',
      url: '/fields/plc/basics/intro-plc',
    },
  ],
};

const postNode: NavigationNodeType = {
  id: 'post-1',
  type: 'post',
  label: 'Introduction to PLC',
  slug: 'intro-plc',
  url: '/fields/plc/basics/intro-plc',
};

describe('NavigationNode', () => {
  const mockOnToggle = vi.fn();
  const mockOnNodeClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render field node with label and post count', () => {
      render(<NavigationNode node={fieldNode} expandedIds={new Set()} onToggle={mockOnToggle} />);

      expect(screen.getByText('PLC')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should render category node with label and post count', () => {
      render(
        <NavigationNode node={categoryNode} expandedIds={new Set()} onToggle={mockOnToggle} />
      );

      expect(screen.getByText('Basics')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should render post node without post count', () => {
      render(<NavigationNode node={postNode} expandedIds={new Set()} onToggle={mockOnToggle} />);

      expect(screen.getByText('Introduction to PLC')).toBeInTheDocument();
      expect(screen.queryByText(/\d+/)).not.toBeInTheDocument();
    });

    it('should render chevron icon for nodes with children', () => {
      const { container } = render(
        <NavigationNode node={fieldNode} expandedIds={new Set()} onToggle={mockOnToggle} />
      );

      // Check for chevron SVG
      const chevron = container.querySelector('svg path[d*="M9 5l7 7-7 7"]');
      expect(chevron).toBeInTheDocument();
    });

    it('should not render chevron icon for leaf nodes', () => {
      const { container } = render(
        <NavigationNode node={postNode} expandedIds={new Set()} onToggle={mockOnToggle} />
      );

      // Check for chevron SVG
      const chevron = container.querySelector('svg path[d*="M9 5l7 7-7 7"]');
      expect(chevron).not.toBeInTheDocument();
    });

    it('should render appropriate icon for field type', () => {
      const { container } = render(
        <NavigationNode node={fieldNode} expandedIds={new Set()} onToggle={mockOnToggle} />
      );

      // Check for folder icon (field icon)
      const folderIcon = container.querySelector('svg path[d*="M3 7v10a2 2 0 002 2h14"]');
      expect(folderIcon).toBeInTheDocument();
    });

    it('should render appropriate icon for category type', () => {
      const { container } = render(
        <NavigationNode node={categoryNode} expandedIds={new Set()} onToggle={mockOnToggle} />
      );

      // Check for document icon (category icon)
      const docIcon = container.querySelector('svg path[d*="M9 12h6m-6 4h6m2 5H7"]');
      expect(docIcon).toBeInTheDocument();
    });

    it('should render appropriate icon for post type', () => {
      const { container } = render(
        <NavigationNode node={postNode} expandedIds={new Set()} onToggle={mockOnToggle} />
      );

      // Check for document icon (post icon)
      const docIcon = container.querySelector('svg path[d*="M9 12h6m-6 4h6m2 5H7"]');
      expect(docIcon).toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    it('should highlight active node based on current pathname', () => {
      mockUsePathname.mockReturnValue('/fields/plc/basics/intro-plc');

      render(<NavigationNode node={postNode} expandedIds={new Set()} onToggle={mockOnToggle} />);

      const link = screen.getByRole('link');
      expect(link).toHaveClass('bg-primary');
      expect(link).toHaveClass('text-primary-foreground');
    });

    it('should not highlight inactive nodes', () => {
      mockUsePathname.mockReturnValue('/fields/scada');

      render(<NavigationNode node={postNode} expandedIds={new Set()} onToggle={mockOnToggle} />);

      const link = screen.getByRole('link');
      expect(link).not.toHaveClass('bg-primary');
      expect(link).toHaveClass('text-foreground');
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('should call onToggle when clicking a field node', () => {
      render(<NavigationNode node={fieldNode} expandedIds={new Set()} onToggle={mockOnToggle} />);

      const link = screen.getByText('PLC').closest('a');
      fireEvent.click(link!);

      expect(mockOnToggle).toHaveBeenCalledWith('field-1');
    });

    it('should call onToggle when clicking a category node', () => {
      render(
        <NavigationNode node={categoryNode} expandedIds={new Set()} onToggle={mockOnToggle} />
      );

      const link = screen.getByText('Basics').closest('a');
      fireEvent.click(link!);

      expect(mockOnToggle).toHaveBeenCalledWith('category-1');
    });

    it('should not call onToggle when clicking a post node', () => {
      render(<NavigationNode node={postNode} expandedIds={new Set()} onToggle={mockOnToggle} />);

      const link = screen.getByRole('link');
      fireEvent.click(link);

      // onToggle should not be called for leaf nodes
      // (they navigate instead of toggling)
      expect(mockOnToggle).not.toHaveBeenCalled();
    });

    it('should rotate chevron when expanded', () => {
      const { container } = render(
        <NavigationNode
          node={fieldNode}
          expandedIds={new Set(['field-1'])}
          onToggle={mockOnToggle}
        />
      );

      const chevron = container.querySelector('svg');
      expect(chevron).toHaveClass('rotate-90');
    });

    it('should not rotate chevron when collapsed', () => {
      const { container } = render(
        <NavigationNode node={fieldNode} expandedIds={new Set()} onToggle={mockOnToggle} />
      );

      const chevron = container.querySelector('svg');
      expect(chevron).not.toHaveClass('rotate-90');
    });

    it('should show children when expanded', () => {
      render(
        <NavigationNode
          node={fieldNode}
          expandedIds={new Set(['field-1'])}
          onToggle={mockOnToggle}
        />
      );

      // Should render child category
      expect(screen.getByText('Basics')).toBeInTheDocument();
    });

    it('should hide children when collapsed', () => {
      render(<NavigationNode node={fieldNode} expandedIds={new Set()} onToggle={mockOnToggle} />);

      // Children container should have opacity-0 and max-h-0
      const childrenWrapper = screen.getByText('Basics').closest('div')
        ?.parentElement?.parentElement;
      expect(childrenWrapper).toHaveClass('opacity-0');
      expect(childrenWrapper).toHaveClass('max-h-0');
    });

    it('should apply smooth transition classes to children container', () => {
      const { container } = render(
        <NavigationNode node={fieldNode} expandedIds={new Set()} onToggle={mockOnToggle} />
      );

      const childContainer = container.querySelector('.transition-all');
      expect(childContainer).toBeInTheDocument();
      expect(childContainer).toHaveClass('duration-300');
      expect(childContainer).toHaveClass('ease-in-out');
    });
  });

  describe('Custom Click Handler', () => {
    it('should call onNodeClick when provided', () => {
      render(
        <NavigationNode
          node={postNode}
          expandedIds={new Set()}
          onToggle={mockOnToggle}
          onNodeClick={mockOnNodeClick}
        />
      );

      const link = screen.getByRole('link');
      fireEvent.click(link);

      expect(mockOnNodeClick).toHaveBeenCalledWith(postNode);
    });

    it('should call both onToggle and onNodeClick for parent nodes', () => {
      render(
        <NavigationNode
          node={fieldNode}
          expandedIds={new Set()}
          onToggle={mockOnToggle}
          onNodeClick={mockOnNodeClick}
        />
      );

      const link = screen.getByText('PLC').closest('a');
      fireEvent.click(link!);

      expect(mockOnToggle).toHaveBeenCalledWith('field-1');
      expect(mockOnNodeClick).toHaveBeenCalledWith(fieldNode);
    });
  });

  describe('Nesting Levels', () => {
    it('should apply correct padding for level 0 (field)', () => {
      render(
        <NavigationNode node={postNode} expandedIds={new Set()} onToggle={mockOnToggle} level={0} />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveStyle({ paddingLeft: '12px' });
    });

    it('should apply correct padding for level 1 (category)', () => {
      render(
        <NavigationNode node={postNode} expandedIds={new Set()} onToggle={mockOnToggle} level={1} />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveStyle({ paddingLeft: '28px' }); // 12 + 16
    });

    it('should apply correct padding for level 2 (post)', () => {
      render(
        <NavigationNode node={postNode} expandedIds={new Set()} onToggle={mockOnToggle} level={2} />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveStyle({ paddingLeft: '44px' }); // 12 + 16*2
    });
  });

  describe('Recursive Rendering', () => {
    it('should recursively render nested children', () => {
      render(
        <NavigationNode
          node={fieldNode}
          expandedIds={new Set(['field-1', 'category-1'])}
          onToggle={mockOnToggle}
        />
      );

      // Should render field, category, and post
      expect(screen.getByText('PLC')).toBeInTheDocument();
      expect(screen.getByText('Basics')).toBeInTheDocument();
      expect(screen.getByText('Introduction to PLC')).toBeInTheDocument();
    });

    it('should pass correct level to nested children', () => {
      render(
        <NavigationNode
          node={fieldNode}
          expandedIds={new Set(['field-1'])}
          onToggle={mockOnToggle}
          level={0}
        />
      );

      // Category should have level 1 padding
      const categoryLink = screen.getByText('Basics').closest('a');
      expect(categoryLink).toHaveStyle({ paddingLeft: '28px' });
    });
  });

  describe('Accessibility', () => {
    it('should render as a link with correct href', () => {
      render(<NavigationNode node={postNode} expandedIds={new Set()} onToggle={mockOnToggle} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/fields/plc/basics/intro-plc');
    });

    it('should have cursor-pointer class for interactivity', () => {
      render(<NavigationNode node={postNode} expandedIds={new Set()} onToggle={mockOnToggle} />);

      const link = screen.getByRole('link');
      expect(link).toHaveClass('cursor-pointer');
    });

    it('should truncate long labels', () => {
      const longLabelNode: NavigationNodeType = {
        ...postNode,
        label: 'This is a very long label that should be truncated to prevent layout issues',
      };

      render(
        <NavigationNode node={longLabelNode} expandedIds={new Set()} onToggle={mockOnToggle} />
      );

      const labelSpan = screen.getByText(longLabelNode.label);
      expect(labelSpan).toHaveClass('truncate');
    });
  });

  describe('Edge Cases', () => {
    it('should handle node with zero post count', () => {
      const nodeWithZeroCount: NavigationNodeType = {
        ...fieldNode,
        postCount: 0,
      };

      render(
        <NavigationNode node={nodeWithZeroCount} expandedIds={new Set()} onToggle={mockOnToggle} />
      );

      // Should not display post count badge when count is 0
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('should handle node without post count', () => {
      const nodeWithoutCount: NavigationNodeType = {
        ...postNode,
        postCount: undefined,
      };

      render(
        <NavigationNode node={nodeWithoutCount} expandedIds={new Set()} onToggle={mockOnToggle} />
      );

      // Should not crash or display undefined
      expect(screen.getByText('Introduction to PLC')).toBeInTheDocument();
    });

    it('should handle node with empty children array', () => {
      const nodeWithEmptyChildren: NavigationNodeType = {
        ...fieldNode,
        children: [],
      };

      const { container } = render(
        <NavigationNode
          node={nodeWithEmptyChildren}
          expandedIds={new Set()}
          onToggle={mockOnToggle}
        />
      );

      // Field nodes should always have chevron (even with empty children)
      const chevron = container.querySelector('svg path[d*="M9 5l7 7-7 7"]');
      expect(chevron).toBeInTheDocument();
    });

    it('should show empty message when field has no categories', () => {
      const nodeWithEmptyChildren: NavigationNodeType = {
        ...fieldNode,
        children: [],
      };

      render(
        <NavigationNode
          node={nodeWithEmptyChildren}
          expandedIds={new Set([fieldNode.id])}
          onToggle={mockOnToggle}
        />
      );

      // Should show "Chưa có danh mục nào cả" when expanded
      expect(screen.getByText('Chưa có danh mục nào cả')).toBeInTheDocument();
    });
  });
});
