import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      reporter: ['text-summary', 'json', 'lcov'],
      exclude: ['**/*.cjs']
    }
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src')
    }
  }
});
