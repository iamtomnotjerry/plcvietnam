/**
 * ThemeToggle Component Tests
 * Validates Requirements: 15.1, 15.2, 15.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

// Mock useThemeContext so we can control theme state
const mockToggleTheme = vi.fn();
const mockThemeContext = { theme: 'light' as 'light' | 'dark', toggleTheme: mockToggleTheme, setTheme: vi.fn() };

vi.mock('@/lib/theme/ThemeProvider', () => ({
  useThemeContext: () => mockThemeContext,
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockToggleTheme.mockClear();
    mockThemeContext.theme = 'light';
  });

  describe('light mode', () => {
    it('shows moon icon in light mode', () => {
      mockThemeContext.theme = 'light';
      render(<ThemeToggle />);

      // Moon path is the crescent shape
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      const path = svg?.querySelector('path');
      expect(path).toBeInTheDocument();
    });

    it('has correct aria-label in light mode', () => {
      mockThemeContext.theme = 'light';
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Chuyển sang chế độ tối');
    });
  });

  describe('dark mode', () => {
    it('shows sun icon in dark mode', () => {
      mockThemeContext.theme = 'dark';
      render(<ThemeToggle />);

      // Sun icon uses <circle> and <line> elements
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      const circle = svg?.querySelector('circle');
      expect(circle).toBeInTheDocument();
    });

    it('has correct aria-label in dark mode', () => {
      mockThemeContext.theme = 'dark';
      render(<ThemeToggle />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Chuyển sang chế độ sáng');
    });
  });

  describe('interaction', () => {
    it('calls toggleTheme when clicked', () => {
      mockThemeContext.theme = 'light';
      render(<ThemeToggle />);

      fireEvent.click(screen.getByRole('button'));

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('renders as a button element', () => {
      render(<ThemeToggle />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('has aria-label set', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button.getAttribute('aria-label')).not.toBe('');
    });

    it('SVG icon is hidden from assistive technology', () => {
      render(<ThemeToggle />);
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('has minimum 44x44 tap target via w-11 h-11 classes', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button');
      // w-11 = 44px, h-11 = 44px in Tailwind
      expect(button.className).toContain('w-11');
      expect(button.className).toContain('h-11');
    });
  });
});
