// @ts-check

/**
 * @type {import('prettier').Config}
 */
export default {
  $schema: 'https://json.schemastore.org/prettierrc',
  useTabs: false,
  printWidth: 120,
  singleQuote: true,
  tabWidth: 2,
  endOfLine: 'lf',
  trailingComma: 'none',
  overrides: [
    {
      files: '*.json',
      options: { parser: 'json' }
    },
    {
      files: '**/frontend/**/*.{js,ts,vue}',
      options: {
        semi: false
      }
    }
  ]
};
