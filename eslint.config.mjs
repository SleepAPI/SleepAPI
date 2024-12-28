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
  {
    ignores: ['**/node_modules', '**/dist', '**/coverage', '**/.vscode', '**/dev-dist', '*.d.ts']
  },

  // frontend-specific rules
  {
    name: 'sleepapi/frontend-rules',
    files: ['**/frontend/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node,
        APP_VERSION: 'readonly' // comes from vite
      },
      sourceType: 'module'
    },
    extends: [...vueRecommended.configs['flat/recommended']]
  },

  // backend-specific rules
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

  // general recommendations
  js.configs.recommended,
  typescriptEslint.configs.recommended,
  prettierConfig,
  prettierRecommended, // prettier last to avoid clash with autoformatting

  // final overwrite custom rules
  {
    plugins: {
      SleepAPILogger: {
        rules: {
          'no-console': {
            meta: {
              type: 'problem',
              docs: {
                description: 'Disallow `console` usage and enforce `logger` usage',
                recommended: true
              },
              fixable: 'code',
              schema: []
            },
            create(context) {
              return {
                CallExpression(node) {
                  if (node.callee.object?.name === 'console') {
                    const method = node.callee.property.name;
                    context.report({
                      node,
                      message: `Use 'logger.${method}' instead of 'console.${method}'.`,
                      fix: (fixer) => fixer.replaceText(node.callee, `logger.${method}`)
                    });
                  }
                }
              };
            }
          }
        }
      }
    },
    rules: {
      // turning this on means we can't do: someBoolean && someFunction()
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports'
        }
      ],
      'SleepAPILogger/no-console': 'error'
    }
  }
);
