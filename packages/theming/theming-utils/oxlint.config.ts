import baseConfig from '@fluentui-react-native/scripts/lint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [baseConfig],
  rules: {
    'typescript/no-var-requires': 'off',
  },
});
