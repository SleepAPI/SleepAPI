import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      reporter: ['text-summary', 'json', 'lcov'],
      exclude: ['**/index.ts']
    }
  }
});
