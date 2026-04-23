/**
 * ThemeProvider Component Tests
 * Validates Requirements: 15.3, 15.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ThemeProvider, useThemeContext } from './ThemeProvider';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

function createMatchMediaMock(matches: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// Test consumer component
function ThemeConsumer() {
  const { theme, toggleTheme, setTheme } = useThemeContext();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme} data-testid="toggle-btn">Toggle</button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark-btn">Set Dark</button>
      <button onClick={() => setTheme('light')} data-testid="set-light-btn">Set Light</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
    vi.clearAllMocks();
    document.documentElement.classList.remove('dark');
    window.matchMedia = createMatchMediaMock(false);
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('should render children', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Hello</div>
      </ThemeProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should provide theme context to children', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await act(async () => {});

    expect(screen.getByTestId('theme-value')).toBeInTheDocument();
  });

  it('should provide toggleTheme function', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await act(async () => {});

    const initialTheme = screen.getByTestId('theme-value').textContent;

    await user.click(screen.getByTestId('toggle-btn'));

    const newTheme = screen.getByTestId('theme-value').textContent;
    expect(newTheme).not.toBe(initialTheme);
  });

  it('should provide setTheme function', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await act(async () => {});

    await user.click(screen.getByTestId('set-dark-btn'));
    expect(screen.getByTestId('theme-value').textContent).toBe('dark');

    await user.click(screen.getByTestId('set-light-btn'));
    expect(screen.getByTestId('theme-value').textContent).toBe('light');
  });

  it('should throw when useThemeContext is used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<ThemeConsumer />);
    }).toThrow('useThemeContext must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });
});
