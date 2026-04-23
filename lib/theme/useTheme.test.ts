/**
 * useTheme Hook Tests
 * Validates Requirements: 15.3, 15.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

// ─── localStorage mock ────────────────────────────────────────────────────────
let localStore: Record<string, string> = {};

const localStorageMock = {
  getItem: (key: string) => localStore[key] ?? null,
  setItem: (key: string, value: string) => { localStore[key] = value; },
  removeItem: (key: string) => { delete localStore[key]; },
  clear: () => { localStore = {}; },
};

// ─── matchMedia mock ──────────────────────────────────────────────────────────
function createMatchMediaMock(prefersDark: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches: prefersDark,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────
beforeEach(() => {
  localStore = {};
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
  document.documentElement.classList.remove('dark');
  // Default: system prefers light, no stored preference
  window.matchMedia = createMatchMediaMock(false);
});

afterEach(() => {
  document.documentElement.classList.remove('dark');
});

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('useTheme', () => {
  describe('initial theme resolution', () => {
    it('defaults to dark when system prefers dark and no stored preference', async () => {
      window.matchMedia = createMatchMediaMock(true);

      const { result } = renderHook(() => useTheme());
      await act(async () => {});

      expect(result.current.theme).toBe('dark');
    });

    it('defaults to light when system prefers light and no stored preference', async () => {
      window.matchMedia = createMatchMediaMock(false);

      const { result } = renderHook(() => useTheme());
      await act(async () => {});

      expect(result.current.theme).toBe('light');
    });

    it('uses stored "light" preference over dark system preference', async () => {
      window.matchMedia = createMatchMediaMock(true);
      localStore['theme'] = 'light';

      const { result } = renderHook(() => useTheme());
      await act(async () => {});

      expect(result.current.theme).toBe('light');
    });

    it('uses stored "dark" preference over light system preference', async () => {
      window.matchMedia = createMatchMediaMock(false);
      localStore['theme'] = 'dark';

      const { result } = renderHook(() => useTheme());
      await act(async () => {});

      expect(result.current.theme).toBe('dark');
    });
  });

  describe('toggleTheme', () => {
    it('toggles from light to dark', async () => {
      window.matchMedia = createMatchMediaMock(false);

      const { result } = renderHook(() => useTheme());
      await act(async () => {});

      expect(result.current.theme).toBe('light');

      act(() => { result.current.toggleTheme(); });

      expect(result.current.theme).toBe('dark');
    });

    it('toggles from dark to light', async () => {
      window.matchMedia = createMatchMediaMock(true);

      const { result } = renderHook(() => useTheme());
      await act(async () => {});

      expect(result.current.theme).toBe('dark');

      act(() => { result.current.toggleTheme(); });

      expect(result.current.theme).toBe('light');
    });

    it('persists toggled theme to localStorage', async () => {
      window.matchMedia = createMatchMediaMock(false);

      const { result } = renderHook(() => useTheme());
      await act(async () => {});

      act(() => { result.current.toggleTheme(); });

      expect(localStore['theme']).toBe('dark');
    });
  });

  describe('setTheme', () => {
    it('sets theme to dark', async () => {
      window.matchMedia = createMatchMediaMock(false);

      const { result } = renderHook(() => useTheme());
      await act(async () => {});

      act(() => { result.current.setTheme('dark'); });

      expect(result.current.theme).toBe('dark');
    });

    it('sets theme to light', async () => {
      window.matchMedia = createMatchMediaMock(true);

      const { result } = renderHook(() => useTheme());
      await act(async () => {});

      act(() => { result.current.setTheme('light'); });

      expect(result.current.theme).toBe('light');
    });

    it('persists theme to localStorage', async () => {
      window.matchMedia = createMatchMediaMock(false);

      const { result } = renderHook(() => useTheme());
      await act(async () => {});

      act(() => { result.current.setTheme('dark'); });

      expect(localStore['theme']).toBe('dark');
    });
  });

  describe('DOM class application', () => {
    it('adds "dark" class to <html> when dark mode is active', async () => {
      window.matchMedia = createMatchMediaMock(true);

      renderHook(() => useTheme());
      await act(async () => {});

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes "dark" class from <html> when light mode is active', async () => {
      window.matchMedia = createMatchMediaMock(false);
      document.documentElement.classList.add('dark'); // pre-existing

      renderHook(() => useTheme());
      await act(async () => {});

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('adds "dark" class when toggling to dark', async () => {
      window.matchMedia = createMatchMediaMock(false);

      const { result } = renderHook(() => useTheme());
      await act(async () => {});

      // Confirm starting state
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      act(() => { result.current.toggleTheme(); });

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes "dark" class when toggling to light', async () => {
      window.matchMedia = createMatchMediaMock(true);

      const { result } = renderHook(() => useTheme());
      await act(async () => {});

      // Confirm starting state
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      act(() => { result.current.toggleTheme(); });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});
