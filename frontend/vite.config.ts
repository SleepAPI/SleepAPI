import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { ManifestOptions, VitePWA } from 'vite-plugin-pwa'
import VueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'
import { name, version } from '../package.json'

const manifest: Partial<ManifestOptions> = {
  name: "Neroli's Lab",
  short_name: "Neroli's Lab",
  display: 'fullscreen',
  description: 'Run your own calculations with our Sleep API-powered simulations.',
  theme_color: '#191224',
  background_color: '#191224',
  icons: [
    {
      src: `pwa-192x192.png`,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable'
    },
    {
      src: `pwa-512x512.png`,
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
      mode: 'production',
      workbox: {
        globPatterns: ['**/*.{js,css,ico,png,svg}'],
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^\/index\.html$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 0 // Ensures no caching of index.html
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 31536000 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        mode: 'production',
        disableDevLogs: true
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
