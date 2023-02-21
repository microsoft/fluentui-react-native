module.exports = {
  extends: ['plugin:@rnx-kit/recommended'],
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
    'no-prototype-builtins': 'off',
    'no-undef': 'off',
    'react/display-name': 'off',
  },
  overrides: [
    {
      files: '**/src/index.{js,ts,tsx}',
      rules: {
        '@rnx-kit/no-export-all': ['error', { expand: 'all' }],
      },
    },
  ],
};
