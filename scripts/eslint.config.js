import js from '@eslint/js';
// @ts-expect-error - no types available
import rnx from '@rnx-kit/eslint-plugin';

// We keep a separate ESLint config to avoid circular dependency
export default [
  ...rnx.configs.strict,
  ...rnx.configs.stylistic,
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        __dirname: 'readonly',
        console: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
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
];
