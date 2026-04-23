/**
 * HamburgerButton Component Tests
 * Validates Requirements: 16.2, 16.6
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HamburgerButton } from './HamburgerButton';

describe('HamburgerButton', () => {
  describe('closed state', () => {
    it('renders a button element', () => {
      render(<HamburgerButton isOpen={false} onClick={vi.fn()} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has aria-label "Mở menu điều hướng" when closed', () => {
      render(<HamburgerButton isOpen={false} onClick={vi.fn()} />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Mở menu điều hướng');
    });

    it('has aria-expanded="false" when closed', () => {
      render(<HamburgerButton isOpen={false} onClick={vi.fn()} />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows hamburger icon (3 lines) when closed', () => {
      render(<HamburgerButton isOpen={false} onClick={vi.fn()} />);
      const lines = document.querySelectorAll('svg line');
      expect(lines.length).toBe(3);
    });
  });

  describe('open state', () => {
    it('has aria-label "Đóng menu điều hướng" when open', () => {
      render(<HamburgerButton isOpen={true} onClick={vi.fn()} />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Đóng menu điều hướng');
    });

    it('has aria-expanded="true" when open', () => {
      render(<HamburgerButton isOpen={true} onClick={vi.fn()} />);
      expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    });

    it('shows X icon (2 lines) when open', () => {
      render(<HamburgerButton isOpen={true} onClick={vi.fn()} />);
      const lines = document.querySelectorAll('svg line');
      expect(lines.length).toBe(2);
    });
  });

  describe('interaction', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<HamburgerButton isOpen={false} onClick={handleClick} />);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('SVG icon is hidden from assistive technology', () => {
      render(<HamburgerButton isOpen={false} onClick={vi.fn()} />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('has minimum 44x44 tap target via w-11 h-11 classes', () => {
      render(<HamburgerButton isOpen={false} onClick={vi.fn()} />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('w-11');
      expect(button.className).toContain('h-11');
    });
  });
});
