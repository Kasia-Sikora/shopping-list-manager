import { configDefaults, defineConfig } from 'vitest/config';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [svgr()],
  test: {
    globals: true,
    environment: 'jsdom',
    includeSource: ['src/**/*.{js,ts}'],
    include: ['./test', './**/*.{test,spec}.{ts,tsx}'],
    exclude: [...configDefaults.exclude, '**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'], // text = CI log summary; lcov = coverage/lcov.info for Codecov
      exclude: ['__mocks__'],
    },
    setupFiles: ['vitest-localstorage-mock', '.configs/tests.setup.ts'],
  },
});
