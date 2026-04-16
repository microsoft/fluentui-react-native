import baseConfig from '@fluentui-react-native/lint-config-rules';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [baseConfig],
  rules: {
    '@rnx-kit/no-export-all': 'off',
    '@rnx-kit/no-foreach-with-captured-variables': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'typescript/array-type': 'off',
  },
});
