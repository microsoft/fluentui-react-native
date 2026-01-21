const rnx = require('@rnx-kit/eslint-plugin');
const sdl = require('@microsoft/eslint-plugin-sdl');

module.exports = [
  ...sdl.configs.common,
  ...rnx.configs.strict,
  // Base configuration for all files
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
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
      '@rnx-kit/no-export-all': ['error', { expand: 'external-only' }],
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/no-array-constructor': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/consistent-type-exports': 'error',
      'no-prototype-builtins': 'off',
      'no-undef': 'off',
      'react/display-name': 'off',
      'react/react-in-jsx-scope': 'off', // unnecessary with new JSX transform
      'react-hooks/exhaustive-deps': 'off', // This should be fixed in the future but is a big change
      'no-restricted-exports': [
        'error',
        {
          restrictDefaultExports: {
            direct: false,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],
    },
  },
  // Override configuration for index files
  {
    files: ['**/src/index.{js,ts,tsx}'],
    rules: {
      '@rnx-kit/no-export-all': ['error', { expand: 'all' }],
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
