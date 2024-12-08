import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  test: {
    setupFiles: './vitest/setup.ts',
    globals: true,
    coverage: {
      reporter: ['text-summary', 'json', 'lcov'], // TODO: this might mess up coverage tools, maybe doesn't generate report
      exclude: ['**/*.cjs']
    }
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src')
    }
  }
});
