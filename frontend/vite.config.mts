import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { ManifestOptions, VitePWA } from 'vite-plugin-pwa'
import VueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'
import { name, version } from './package.json'

const manifest: Partial<ManifestOptions> = {
  name: 'Sleep API',
  short_name: 'Sleep API',
  display: 'fullscreen',
  description:
    "Run your own simulation-based calculations with Sleep API's built-in data analysis.",
  theme_color: '#191224',
  background_color: '#191224',
  icons: [
    {
      src: 'pwa-64x64.png',
      sizes: '64x64',
      type: 'image/png'
    },
    {
      src: `pwa-192x192.png`,
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: `pwa-512x512.png`,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: 'maskable-icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable'
    }
  ]
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest,
      strategies: 'generateSW',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallbackDenylist: [/^\/api/]
      },
      includeAssets: ['apple-touch-icon.png', 'favicon.ico'],
      devOptions: {
        enabled: true
      }
    }),
    VueDevTools()
  ],
  server: {
    host: true,
    port: 8001,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    server: {
      deps: {
        inline: ['vuetify']
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          faker: ['@faker-js/faker']
        }
      }
    }
  },
  define: {
    APP_NAME: JSON.stringify(name),
    APP_VERSION: JSON.stringify(version),
    __INTLIFY_JIT_COMPILATION__: true
  }
})
