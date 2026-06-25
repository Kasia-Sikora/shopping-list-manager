import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    includeSource: ['src/**/*.{js,ts}'],
    include: ['./test', './**/*.{test,spec}.{ts,tsx}'],
    exclude: [...configDefaults.exclude, '**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      exclude: ['__mocks__']
    },
    setupFiles: ['vitest-localstorage-mock', '.configs/tests.setup.ts'],
  },
});
