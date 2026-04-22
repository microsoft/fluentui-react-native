import { defineConfig, type OxlintConfig } from 'oxlint';
// @ts-ignore -- @rnx-kit/oxlint-config ships untyped JS; types.d.ts covers the local build
import sdlRequired from '@rnx-kit/oxlint-config/sdl-required';
// @ts-ignore -- same as above
import strict from '@rnx-kit/oxlint-config/strict';
// @ts-ignore -- same as above
import stylistic from '@rnx-kit/oxlint-config/typescript-stylistic';

export default defineConfig({
  extends: [sdlRequired, strict, stylistic] as OxlintConfig[],
  rules: {
    '@rnx-kit/no-foreach-with-captured-variables': 'error',
    'import/no-default-export': 'off',
    'no-prototype-builtins': 'off',
    'no-unneeded-ternary': 'off',
    'typescript/consistent-indexed-object-style': 'off',
    'typescript/consistent-type-definitions': 'off',
    'typescript/no-explicit-any': 'off',
    'typescript/no-inferrable-types': 'off',
  },
  overrides: [
    {
      files: ['**/*.config.[jt]s'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
    {
      files: ['**/types.ts'],
      rules: {
        '@rnx-kit/type-definitions-only': 'error',
      },
    },
    {
      files: ['**/src/index.{js,ts,tsx}'],
      rules: {
        '@rnx-kit/no-export-all': ['error', { expand: 'all' }],
      },
    },
    {
      files: ['**/*.test.{js,ts,tsx}', '**/*.spec.{js,ts,tsx}'],
      rules: {
        'no-empty-function': 'off',
      },
    },
  ],
  ignorePatterns: ['node_modules/**', '*.config.js', 'dist/**/*', 'coverage/**/*', 'lib/**/*', 'out/**/*'],
});
