import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  ssr: {
    noExternal: ['next-intl'],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        'vitest.config.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
        '.next/',
        'coverage/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'coverage'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      // next-intl imports `next/navigation`; Vitest needs the explicit .js target (Next 16).
      'next/navigation': path.resolve(__dirname, 'node_modules/next/navigation.js'),
    },
  },
});
