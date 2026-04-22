import baseConfig from '@fluentui-react-native/lint-config-rules';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [baseConfig],
  rules: {
    '@rnx-kit/no-export-all': 'off',
    'typescript/class-literal-property-style': 'off',
    'typescript/no-duplicate-enum-values': 'off',
    'typescript/no-invalid-void-type': 'off',
  },
});
