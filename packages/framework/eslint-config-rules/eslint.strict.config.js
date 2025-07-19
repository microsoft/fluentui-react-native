// @ts-ignore - no declaration file
const rnx = require('@rnx-kit/eslint-plugin');
// @ts-ignore - no declaration file
const sdl = require('@microsoft/eslint-plugin-sdl');
const tsLint = require('typescript-eslint');

module.exports = [
  ...sdl.configs.common,
  ...tsLint.configs.strict,
  ...rnx.configs.strict,
  // Base configuration for all files
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', 'apps/*/tsconfig.json', 'packages/*/*/tsconfig.json'],
      },
    },
    rules: {
      indent: 'off',
      'no-unused-vars': 'off',
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],
      '@rnx-kit/no-const-enum': 'error',
      '@rnx-kit/no-export-all': ['error', { expand: 'all' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      'no-restricted-exports': 'error',
    },
  },
  {
    files: ['**/*.test.{js,ts,tsx}', '**/*.spec.{js,ts,tsx}'],
    languageOptions: {
      globals: {
        // These are provided by the jest environment
        // https://jestjs.io/docs/using-matchers
        expect: 'readonly',
        test: 'readonly',
        describe: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  // Common ignore patterns
  {
    ignores: ['node_modules/**', '*.config.js', 'dist/**/*', 'coverage/**/*', 'lib/**/*', 'out/**/*'],
  },
];
