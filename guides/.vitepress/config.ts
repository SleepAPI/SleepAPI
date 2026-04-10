import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vuetify from 'vite-plugin-vuetify';
import { defineConfig, type DefaultTheme } from 'vitepress';
import { loadGuideEmojisByName } from './lib/guide-emojis';
import { splitIntoSectionsForLocalSearch } from './lib/local-search-sections';
import { markdownItGuideEmojis } from './lib/markdown-it-guide-emojis';
import { buildSidebar } from './lib/sidebar';
import { vitepressLocalSearchPreamblePlugin } from './lib/vitepress-local-search-preamble-plugin';

const __dirname = dirname(fileURLToPath(import.meta.url));
const guidesRoot = resolve(__dirname, '..');
const guidesContentRoot = resolve(guidesRoot, 'content');
const guidesEmojisRoot = resolve(guidesRoot, 'images/emojis');
const guideEmojisByName = loadGuideEmojisByName(guidesEmojisRoot);
const siteBase = '/guides/';

export default defineConfig({
  srcDir: 'content',
  base: siteBase,
  title: "Neroli's Lab Guides",
  description: 'Guides for understanding Pokémon Sleep mechanics',

  head: [
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600&family=Roboto:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap'
      }
    ]
  ],

  ignoreDeadLinks: [/^http:\/\/localhost/, /^https:\/\/localhost/],

  themeConfig: {
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          _splitIntoSections: splitIntoSectionsForLocalSearch
        }
      }
    },
    outline: {
      level: [2, 3]
    },
    sidebar: buildSidebar(guidesContentRoot) as DefaultTheme.Config['sidebar'],
    editLink: {
      pattern: 'https://github.com/nerolis-lab/nerolis-lab/edit/main/guides/content/:path',
      text: 'Edit this page on GitHub'
    },
    docFooter: {
      prev: 'Previous',
      next: 'Next'
    },
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    }
  },

  markdown: {
    theme: 'synthwave-84',
    lineNumbers: true,
    config: (md) => {
      //set up custom emoji shortcodes
      markdownItGuideEmojis(md, { emojis: guideEmojisByName });
    }
  },

  vite: {
    resolve: {
      alias: {
        // Resolved from the patched VPLocalSearchBox path under node_modules.
        '@guides/vitepress-local-search-preamble': resolve(__dirname, 'lib/fill-local-search-preamble-map.ts')
      }
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': 'http://localhost:3000'
      }
    },
    ssr: {
      noExternal: ['vuetify']
    },
    // Preamble plugin runs first (enforce: 'pre'); order relative to vuetify is irrelevant for the transform.
    plugins: [vitepressLocalSearchPreamblePlugin(), vuetify({ autoImport: true })]
  }
});
