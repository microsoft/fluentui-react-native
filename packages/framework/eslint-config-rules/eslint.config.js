const rnx = require('@rnx-kit/eslint-plugin');
const sdl = require('@microsoft/eslint-plugin-sdl');
const tsLint = require('typescript-eslint');

module.exports = [
  ...sdl.configs.common,
  ...tsLint.configs.recommended,
  ...rnx.configs.recommended,
  // Base configuration for all files
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', 'apps/*/tsconfig.json', 'packages/*/*/tsconfig.json'],
      },
    },
    rules: {
      '@rnx-kit/no-const-enum': 'error',
      '@rnx-kit/no-export-all': ['error', { expand: 'external-only' }],
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/no-array-constructor': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/consistent-type-exports': 'error',
      'no-prototype-builtins': 'off',
      'no-undef': 'off',
      'react/display-name': 'off',
    },
  },
  // Override configuration for index files
  {
    files: ['**/src/index.{js,ts,tsx}'],
    rules: {
      '@rnx-kit/no-export-all': ['error', { expand: 'all' }],
    },
  },
];
