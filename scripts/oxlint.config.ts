import config from '../packages/configs/lint-config-rules/private.ts';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [config],
  rules: {
    '@rnx-kit/no-foreach-with-captured-variables': 'off',
    'import/no-default-export': 'off',
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
});
