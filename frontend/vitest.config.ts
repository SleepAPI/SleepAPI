import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*', '**/main.ts'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        include: ['**/src/**'],
        reporter: ['text-summary', 'json', 'lcov'], // TODO: this might mess up coverage tools, maybe doesn't generate report
        exclude: ['**/node_modules/**', '**/test/**', '**/main.ts', '**/index.ts']
      },
      setupFiles: ['./src/vitest']
    }
  })
)
