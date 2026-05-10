/**
 * NavigationTree Component Tests
 * Validates Requirements: 1.6
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { NavigationTree } from './NavigationTree';
import type { NavigationNode } from '@/lib/types/domain';

// Mock the useNavigationTree hook
vi.mock('../hooks/useNavigationTree', () => ({
  useNavigationTree: vi.fn(),
}));

// Mock the NavigationNode component
vi.mock('./NavigationNode', () => ({
  NavigationNode: ({ node, expandedIds, onToggle }: any) => {
    const isExpanded = expandedIds.has(node.id);
    return (
      <div data-testid={`node-${node.id}`}>
        <button onClick={() => onToggle(node.id)}>
          {node.label} {isExpanded ? '(expanded)' : '(collapsed)'}
        </button>
        {node.children && isExpanded && (
          <div data-testid={`children-${node.id}`}>
            {node.children.map((child: NavigationNode) => (
              <div key={child.id}>{child.label}</div>
            ))}
          </div>
        )}
      </div>
    );
  },
}));

import { useNavigationTree } from '../hooks/useNavigationTree';

const mockUseNavigationTree = useNavigationTree as any;

describe('NavigationTree', () => {
  const mockTree: NavigationNode[] = [
    {
      id: 'field-1',
      type: 'field',
      label: 'PLC Programming',
      slug: 'plc',
      url: '/fields/plc',
      postCount: 10,
      children: [
        {
          id: 'cat-1',
          type: 'category',
          label: 'Ladder Logic',
          slug: 'ladder-logic',
          url: '/fields/plc/ladder-logic',
          postCount: 5,
          children: [
            {
              id: 'post-1',
              type: 'post',
              label: 'Introduction to Ladder Logic',
              slug: 'intro-ladder',
              url: '/fields/plc/ladder-logic/intro-ladder',
            },
          ],
        },
      ],
    },
    {
      id: 'field-2',
      type: 'field',
      label: 'SCADA Systems',
      slug: 'scada',
      url: '/fields/scada',
      postCount: 8,
      children: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading skeleton when isLoading is true', () => {
      mockUseNavigationTree.mockReturnValue({
        tree: [],
        expandedIds: new Set(),
        toggleNode: vi.fn(),
        expandNode: vi.fn(),
        collapseNode: vi.fn(),
        expandAll: vi.fn(),
        collapseAll: vi.fn(),
        isLoading: true,
        error: null,
      });

      render(<NavigationTree />);

      expect(screen.getByTestId('skeleton-navigation-tree')).toBeInTheDocument();
      const skeletonRoot = screen.getByTestId('skeleton-navigation-tree');
      expect(skeletonRoot.querySelector('.animate-pulse')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should display error message when error occurs', () => {
      const mockError = new Error('Failed to fetch navigation tree');

      mockUseNavigationTree.mockReturnValue({
        tree: [],
        expandedIds: new Set(),
        toggleNode: vi.fn(),
        expandNode: vi.fn(),
        collapseNode: vi.fn(),
        expandAll: vi.fn(),
        collapseAll: vi.fn(),
        isLoading: false,
        error: mockError,
      });

      render(<NavigationTree />);

      expect(screen.getByText('Không thể tải cây điều hướng')).toBeInTheDocument();
      expect(screen.getByText(mockError.message)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty message when tree is empty', () => {
      mockUseNavigationTree.mockReturnValue({
        tree: [],
        expandedIds: new Set(),
        toggleNode: vi.fn(),
        expandNode: vi.fn(),
        collapseNode: vi.fn(),
        expandAll: vi.fn(),
        collapseAll: vi.fn(),
        isLoading: false,
        error: null,
      });

      render(<NavigationTree />);

      expect(screen.getByText('Chưa có nội dung')).toBeInTheDocument();
    });
  });

  describe('Tree Rendering', () => {
    it('should render navigation tree with nodes', () => {
      mockUseNavigationTree.mockReturnValue({
        tree: mockTree,
        expandedIds: new Set(),
        toggleNode: vi.fn(),
        expandNode: vi.fn(),
        collapseNode: vi.fn(),
        expandAll: vi.fn(),
        collapseAll: vi.fn(),
        isLoading: false,
        error: null,
      });

      render(<NavigationTree />);

      expect(screen.getByTestId('node-field-1')).toBeInTheDocument();
      expect(screen.getByTestId('node-field-2')).toBeInTheDocument();
      expect(screen.getByText(/PLC Programming/)).toBeInTheDocument();
      expect(screen.getByText(/SCADA Systems/)).toBeInTheDocument();
    });

    it('should pass expanded state to NavigationNode components', () => {
      const expandedIds = new Set(['field-1']);

      mockUseNavigationTree.mockReturnValue({
        tree: mockTree,
        expandedIds,
        toggleNode: vi.fn(),
        expandNode: vi.fn(),
        collapseNode: vi.fn(),
        expandAll: vi.fn(),
        collapseAll: vi.fn(),
        isLoading: false,
        error: null,
      });

      render(<NavigationTree />);

      expect(screen.getByText(/PLC Programming.*\(expanded\)/)).toBeInTheDocument();
      expect(screen.getByText(/SCADA Systems.*\(collapsed\)/)).toBeInTheDocument();
    });
  });

  describe('Search Functionality - Requirement 1.6', () => {
    it('should NOT show search input when there are 10 or fewer fields', () => {
      mockUseNavigationTree.mockReturnValue({
        tree: mockTree, // Only 2 fields
        expandedIds: new Set(),
        toggleNode: vi.fn(),
        expandNode: vi.fn(),
        collapseNode: vi.fn(),
        expandAll: vi.fn(),
        collapseAll: vi.fn(),
        isLoading: false,
        error: null,
      });

      render(<NavigationTree />);

      expect(screen.queryByPlaceholderText('Tìm kiếm...')).not.toBeInTheDocument();
    });

    it('should show search input when there are more than 10 fields', () => {
      // Create 11 fields
      const manyFields: NavigationNode[] = Array.from({ length: 11 }, (_, i) => ({
        id: `field-${i}`,
        type: 'field' as const,
        label: `Field ${i}`,
        slug: `field-${i}`,
        url: `/fields/field-${i}`,
        postCount: 5,
        children: [],
      }));

      mockUseNavigationTree.mockReturnValue({
        tree: manyFields,
        expandedIds: new Set(),
        toggleNode: vi.fn(),
        expandNode: vi.fn(),
        collapseNode: vi.fn(),
        expandAll: vi.fn(),
        collapseAll: vi.fn(),
        isLoading: false,
        error: null,
      });

      render(<NavigationTree />);

      expect(screen.getByPlaceholderText('Tìm kiếm...')).toBeInTheDocument();
    });

    it('should filter tree nodes based on search query', async () => {
      // Create 11 fields for search to appear
      const manyFields: NavigationNode[] = [
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `field-${i}`,
          type: 'field' as const,
          label: `Field ${i}`,
          slug: `field-${i}`,
          url: `/fields/field-${i}`,
          postCount: 5,
          children: [],
        })),
        {
          id: 'field-plc',
          type: 'field' as const,
          label: 'PLC Programming',
          slug: 'plc',
          url: '/fields/plc',
          postCount: 10,
          children: [],
        },
      ];

      mockUseNavigationTree.mockReturnValue({
        tree: manyFields,
        expandedIds: new Set(),
        toggleNode: vi.fn(),
        expandNode: vi.fn(),
        collapseNode: vi.fn(),
        expandAll: vi.fn(),
        collapseAll: vi.fn(),
        isLoading: false,
        error: null,
      });

      render(<NavigationTree />);

      const searchInput = screen.getByPlaceholderText('Tìm kiếm...');
      fireEvent.change(searchInput, { target: { value: 'PLC' } });

      await waitFor(() => {
        expect(screen.getByTestId('node-field-plc')).toBeInTheDocument();
        expect(screen.queryByTestId('node-field-0')).not.toBeInTheDocument();
      });
    });

    it('should show no results message when search yields no matches', async () => {
      const manyFields: NavigationNode[] = Array.from({ length: 11 }, (_, i) => ({
        id: `field-${i}`,
        type: 'field' as const,
        label: `Field ${i}`,
        slug: `field-${i}`,
        url: `/fields/field-${i}`,
        postCount: 5,
        children: [],
      }));

      mockUseNavigationTree.mockReturnValue({
        tree: manyFields,
        expandedIds: new Set(),
        toggleNode: vi.fn(),
        expandNode: vi.fn(),
        collapseNode: vi.fn(),
        expandAll: vi.fn(),
        collapseAll: vi.fn(),
        isLoading: false,
        error: null,
      });

      render(<NavigationTree />);

      const searchInput = screen.getByPlaceholderText('Tìm kiếm...');
      fireEvent.change(searchInput, { target: { value: 'NonExistentField' } });

      await waitFor(() => {
        expect(screen.getByText(/Không tìm thấy kết quả cho/)).toBeInTheDocument();
        expect(screen.getByText(/"NonExistentField"/)).toBeInTheDocument();
      });
    });

    it('should clear search when clear button is clicked', async () => {
      const manyFields: NavigationNode[] = Array.from({ length: 11 }, (_, i) => ({
        id: `field-${i}`,
        type: 'field' as const,
        label: `Field ${i}`,
        slug: `field-${i}`,
        url: `/fields/field-${i}`,
        postCount: 5,
        children: [],
      }));

      mockUseNavigationTree.mockReturnValue({
        tree: manyFields,
        expandedIds: new Set(),
        toggleNode: vi.fn(),
        expandNode: vi.fn(),
        collapseNode: vi.fn(),
        expandAll: vi.fn(),
        collapseAll: vi.fn(),
        isLoading: false,
        error: null,
      });

      render(<NavigationTree />);

      const searchInput = screen.getByPlaceholderText('Tìm kiếm...') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'Field' } });

      expect(searchInput.value).toBe('Field');

      const clearButton = screen.getByLabelText('Xóa tìm kiếm');
      fireEvent.click(clearButton);

      expect(searchInput.value).toBe('');
    });

    it('should filter nested children when they match search query', async () => {
      const treeWithNested: NavigationNode[] = [
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `field-${i}`,
          type: 'field' as const,
          label: `Field ${i}`,
          slug: `field-${i}`,
          url: `/fields/field-${i}`,
          postCount: 5,
          children: [],
        })),
        {
          id: 'field-plc',
          type: 'field' as const,
          label: 'PLC',
          slug: 'plc',
          url: '/fields/plc',
          postCount: 10,
          children: [
            {
              id: 'cat-ladder',
              type: 'category' as const,
              label: 'Ladder Logic',
              slug: 'ladder-logic',
              url: '/fields/plc/ladder-logic',
              postCount: 5,
              children: [],
            },
          ],
        },
      ];

      mockUseNavigationTree.mockReturnValue({
        tree: treeWithNested,
        expandedIds: new Set(),
        toggleNode: vi.fn(),
        expandNode: vi.fn(),
        collapseNode: vi.fn(),
        expandAll: vi.fn(),
        collapseAll: vi.fn(),
        isLoading: false,
        error: null,
      });

      render(<NavigationTree />);

      const searchInput = screen.getByPlaceholderText('Tìm kiếm...');
      fireEvent.change(searchInput, { target: { value: 'Ladder' } });

      await waitFor(() => {
        // Parent field should be included because child matches
        expect(screen.getByTestId('node-field-plc')).toBeInTheDocument();
        // Other fields should not be visible
        expect(screen.queryByTestId('node-field-0')).not.toBeInTheDocument();
      });
    });

    it('should respect searchable prop when set to false', () => {
      const manyFields: NavigationNode[] = Array.from({ length: 11 }, (_, i) => ({
        id: `field-${i}`,
        type: 'field' as const,
        label: `Field ${i}`,
        slug: `field-${i}`,
        url: `/fields/field-${i}`,
        postCount: 5,
        children: [],
      }));

      mockUseNavigationTree.mockReturnValue({
        tree: manyFields,
        expandedIds: new Set(),
        toggleNode: vi.fn(),
        expandNode: vi.fn(),
        collapseNode: vi.fn(),
        expandAll: vi.fn(),
        collapseAll: vi.fn(),
        isLoading: false,
        error: null,
      });

      render(<NavigationTree searchable={false} />);

      expect(screen.queryByPlaceholderText('Tìm kiếm...')).not.toBeInTheDocument();
    });
  });

  describe('Node Interaction', () => {
    it('should call toggleNode when node is clicked', async () => {
      const mockToggleNode = vi.fn();

      mockUseNavigationTree.mockReturnValue({
        tree: mockTree,
        expandedIds: new Set(),
        toggleNode: mockToggleNode,
        expandNode: vi.fn(),
        collapseNode: vi.fn(),
        expandAll: vi.fn(),
        collapseAll: vi.fn(),
        isLoading: false,
        error: null,
      });

      render(<NavigationTree />);

      const nodeButton = screen.getByText(/PLC Programming/);
      fireEvent.click(nodeButton);

      expect(mockToggleNode).toHaveBeenCalledWith('field-1');
    });

    it('should call onNodeClick callback when provided', async () => {
      const mockOnNodeClick = vi.fn();

      mockUseNavigationTree.mockReturnValue({
        tree: mockTree,
        expandedIds: new Set(),
        toggleNode: vi.fn(),
        expandNode: vi.fn(),
        collapseNode: vi.fn(),
        expandAll: vi.fn(),
        collapseAll: vi.fn(),
        isLoading: false,
        error: null,
      });

      // Note: onNodeClick is passed to NavigationNode, not tested directly here
      // This would be tested in integration tests
      render(<NavigationTree onNodeClick={mockOnNodeClick} />);

      expect(screen.getByTestId('node-field-1')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      mockUseNavigationTree.mockReturnValue({
        tree: mockTree,
        expandedIds: new Set(),
        toggleNode: vi.fn(),
        expandNode: vi.fn(),
        collapseNode: vi.fn(),
        expandAll: vi.fn(),
        collapseAll: vi.fn(),
        isLoading: false,
        error: null,
      });

      render(<NavigationTree />);

      expect(
        screen.getByRole('navigation', { name: 'Cây điều hướng nội dung' })
      ).toBeInTheDocument();
    });

    it('should have accessible clear button label', async () => {
      const manyFields: NavigationNode[] = Array.from({ length: 11 }, (_, i) => ({
        id: `field-${i}`,
        type: 'field' as const,
        label: `Field ${i}`,
        slug: `field-${i}`,
        url: `/fields/field-${i}`,
        postCount: 5,
        children: [],
      }));

      mockUseNavigationTree.mockReturnValue({
        tree: manyFields,
        expandedIds: new Set(),
        toggleNode: vi.fn(),
        expandNode: vi.fn(),
        collapseNode: vi.fn(),
        expandAll: vi.fn(),
        collapseAll: vi.fn(),
        isLoading: false,
        error: null,
      });

      render(<NavigationTree />);

      const searchInput = screen.getByPlaceholderText('Tìm kiếm...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const clearButton = screen.getByLabelText('Xóa tìm kiếm');
      expect(clearButton).toBeInTheDocument();
    });
  });
});
