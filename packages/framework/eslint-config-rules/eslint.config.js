const strictConfig = require('./eslint.strict.config');

module.exports = [
  ...strictConfig,
  // Base configuration for all files
  {
    rules: {
      '@rnx-kit/no-export-all': ['error', { expand: 'external-only' }],
      '@typescript-eslint/consistent-type-assertions': 'off',
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
];
