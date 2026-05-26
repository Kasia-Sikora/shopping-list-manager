import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    includeSource: ['src/**/*.{js,ts}'],
    include: ['./test', './**/*.{test,spec}.tsx'],
    exclude: [...configDefaults.exclude, '**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
    },
    setupFiles: ['.configs/tests.setup.ts'],
  },
});
