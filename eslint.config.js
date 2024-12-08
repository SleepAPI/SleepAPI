// @ts-check
// eslint typescript support is still in experimental stage

import typescriptEslint from 'typescript-eslint';

import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import vueRecommended from 'eslint-plugin-vue';
import globals from 'globals';

export default typescriptEslint.config(
  { ignores: ['**/node_modules', '**/dist', '**/coverage', '**/.vscode', '**/dev-dist', '*.d.ts'] },
  {
    name: 'sleepapi/frontend-rules',
    files: ['**/frontend/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node
      },
      sourceType: 'module'
    },
    extends: [...vueRecommended.configs['flat/recommended']]
  },
  {
    name: 'sleepapi/backend-rules',
    files: ['**/backend/**', '**/common/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser, // backend has swagger frontend
        ...globals.node
      },
      sourceType: 'module',
      parser: tsParser
    },
    plugins: { ts }
  },
  js.configs.recommended,
  prettierConfig,
  prettierRecommended
);
