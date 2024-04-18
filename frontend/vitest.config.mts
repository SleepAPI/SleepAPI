import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import { configDefaults, defineConfig } from 'vitest/config'
import viteConfig from './vite.config.mjs'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*', '**/main.ts'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        include: ['**/src/**'],
        exclude: ['**/node_modules/**', '**/test/**', '**/main.ts']
      },
      setupFiles: ['./src/vitest']
    }
  })
)
