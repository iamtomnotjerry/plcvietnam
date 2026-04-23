/**
 * MobileSearchOverlay Component Tests
 * Validates Requirements: 16.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileSearchOverlay } from './MobileSearchOverlay';

// Mock SearchInput to keep tests focused on overlay behaviour
vi.mock('@/features/search/components/SearchInput', () => ({
  SearchInput: ({ variant, onResultClick }: { variant?: string; onResultClick?: () => void }) => (
    <div data-testid="search-input" data-variant={variant}>
      <button onClick={onResultClick}>Select result</button>
    </div>
  ),
}));

describe('MobileSearchOverlay', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  describe('trigger button', () => {
    it('renders a search icon button', () => {
      render(<MobileSearchOverlay />);
      expect(screen.getByRole('button', { name: 'Mở tìm kiếm' })).toBeInTheDocument();
    });

    it('has 44x44 tap target (w-11 h-11)', () => {
      render(<MobileSearchOverlay />);
      const btn = screen.getByRole('button', { name: 'Mở tìm kiếm' });
      expect(btn.className).toContain('w-11');
      expect(btn.className).toContain('h-11');
    });

    it('is hidden on desktop via md:hidden class', () => {
      render(<MobileSearchOverlay />);
      const btn = screen.getByRole('button', { name: 'Mở tìm kiếm' });
      expect(btn.className).toContain('md:hidden');
    });

    it('SVG icon is hidden from assistive technology', () => {
      render(<MobileSearchOverlay />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('closed state', () => {
    it('does not show overlay when closed', () => {
      render(<MobileSearchOverlay />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('does not render SearchInput when closed', () => {
      render(<MobileSearchOverlay />);
      expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
    });
  });

  describe('open state', () => {
    it('opens overlay when trigger button is clicked', () => {
      render(<MobileSearchOverlay />);
      fireEvent.click(screen.getByRole('button', { name: 'Mở tìm kiếm' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders dialog with aria-modal when open', () => {
      render(<MobileSearchOverlay />);
      fireEvent.click(screen.getByRole('button', { name: 'Mở tìm kiếm' }));
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('renders SearchInput with overlay variant', () => {
      render(<MobileSearchOverlay />);
      fireEvent.click(screen.getByRole('button', { name: 'Mở tìm kiếm' }));
      expect(screen.getByTestId('search-input')).toHaveAttribute('data-variant', 'overlay');
    });

    it('overlay is full-screen (fixed inset-0)', () => {
      render(<MobileSearchOverlay />);
      fireEvent.click(screen.getByRole('button', { name: 'Mở tìm kiếm' }));
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('fixed');
      expect(dialog.className).toContain('inset-0');
    });

    it('overlay is hidden on desktop via md:hidden', () => {
      render(<MobileSearchOverlay />);
      fireEvent.click(screen.getByRole('button', { name: 'Mở tìm kiếm' }));
      const dialog = screen.getByRole('dialog');
      expect(dialog.className).toContain('md:hidden');
    });

    it('prevents body scroll when open', () => {
      render(<MobileSearchOverlay />);
      fireEvent.click(screen.getByRole('button', { name: 'Mở tìm kiếm' }));
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('shows close button with 44x44 tap target', () => {
      render(<MobileSearchOverlay />);
      fireEvent.click(screen.getByRole('button', { name: 'Mở tìm kiếm' }));
      const closeBtn = screen.getByRole('button', { name: 'Đóng tìm kiếm' });
      expect(closeBtn.className).toContain('w-11');
      expect(closeBtn.className).toContain('h-11');
    });
  });

  describe('closing behaviour', () => {
    it('closes when close button is clicked', () => {
      render(<MobileSearchOverlay />);
      fireEvent.click(screen.getByRole('button', { name: 'Mở tìm kiếm' }));
      fireEvent.click(screen.getByRole('button', { name: 'Đóng tìm kiếm' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes when Escape key is pressed', () => {
      render(<MobileSearchOverlay />);
      fireEvent.click(screen.getByRole('button', { name: 'Mở tìm kiếm' }));
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes when a search result is selected', () => {
      render(<MobileSearchOverlay />);
      fireEvent.click(screen.getByRole('button', { name: 'Mở tìm kiếm' }));
      fireEvent.click(screen.getByRole('button', { name: 'Select result' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('restores body scroll when closed', () => {
      render(<MobileSearchOverlay />);
      fireEvent.click(screen.getByRole('button', { name: 'Mở tìm kiếm' }));
      expect(document.body.style.overflow).toBe('hidden');
      fireEvent.click(screen.getByRole('button', { name: 'Đóng tìm kiếm' }));
      expect(document.body.style.overflow).toBe('');
    });

    it('Escape key does nothing when overlay is closed', () => {
      render(<MobileSearchOverlay />);
      // Should not throw
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
