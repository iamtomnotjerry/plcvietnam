/**
 * MobileNavDrawer Component Tests
 * Validates Requirements: 16.2, 16.6
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileNavDrawer } from './MobileNavDrawer';

// Mock sidebar modes to keep tests focused on drawer behaviour
vi.mock('@/features/navigation/components/NavigationSidebarModes', () => ({
  NavigationSidebarModes: ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav data-testid="navigation-tree">
      <button type="button" onClick={onNavigate}>
        Nav item
      </button>
    </nav>
  ),
}));

describe('MobileNavDrawer', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  describe('closed state', () => {
    it('renders backdrop and drawer in DOM but hidden', () => {
      render(<MobileNavDrawer isOpen={false} onClose={vi.fn()} />);
      // Dialog is present but translated off-screen
      const dialog = screen.getByRole('dialog', { hidden: true });
      expect(dialog.className).toContain('-translate-x-full');
    });

    it('backdrop is not interactive when closed', () => {
      render(<MobileNavDrawer isOpen={false} onClose={vi.fn()} />);
      // The backdrop div has pointer-events-none when closed
      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop?.className).toContain('pointer-events-none');
    });
  });

  describe('open state', () => {
    it('renders dialog with aria-modal when open', () => {
      render(<MobileNavDrawer isOpen={true} onClose={vi.fn()} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('drawer slides in (no -translate-x-full) when open', () => {
      render(<MobileNavDrawer isOpen={true} onClose={vi.fn()} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).not.toContain('-translate-x-full');
      expect(dialog.className).toContain('translate-x-0');
    });

    it('shows NavigationTree inside drawer', () => {
      render(<MobileNavDrawer isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByTestId('navigation-tree')).toBeInTheDocument();
    });

    it('close button has 44x44 tap target (w-11 h-11)', () => {
      render(<MobileNavDrawer isOpen={true} onClose={vi.fn()} />);
      const closeBtn = screen.getByRole('button', { name: 'Đóng menu điều hướng' });
      expect(closeBtn.className).toContain('w-11');
      expect(closeBtn.className).toContain('h-11');
    });

    it('close button has correct aria-label', () => {
      render(<MobileNavDrawer isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Đóng menu điều hướng' })).toBeInTheDocument();
    });

    it('prevents body scroll when open', () => {
      render(<MobileNavDrawer isOpen={true} onClose={vi.fn()} />);
      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  describe('closing behaviour', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<MobileNavDrawer isOpen={true} onClose={onClose} />);
      fireEvent.click(screen.getByRole('button', { name: 'Đóng menu điều hướng' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', () => {
      const onClose = vi.fn();
      render(<MobileNavDrawer isOpen={true} onClose={onClose} />);
      const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement;
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn();
      render(<MobileNavDrawer isOpen={true} onClose={onClose} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when a nav item is clicked (via onNodeClick)', () => {
      const onClose = vi.fn();
      render(<MobileNavDrawer isOpen={true} onClose={onClose} />);
      fireEvent.click(screen.getByText('Nav item'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('restores body scroll when closed', () => {
      const { rerender } = render(<MobileNavDrawer isOpen={true} onClose={vi.fn()} />);
      expect(document.body.style.overflow).toBe('hidden');
      rerender(<MobileNavDrawer isOpen={false} onClose={vi.fn()} />);
      expect(document.body.style.overflow).toBe('');
    });
  });
});
