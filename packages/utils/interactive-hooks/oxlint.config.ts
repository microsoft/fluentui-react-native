import baseConfig from '@fluentui-react-native/lint-config-rules';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [baseConfig],
  rules: {
    'typescript/no-var-requires': 'off',
  },
});
