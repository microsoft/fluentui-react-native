import baseConfig from '@fluentui-react-native/lint-config-rules';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [baseConfig],
  rules: {
    'typescript/consistent-type-definitions': 'off',
  },
  ignorePatterns: ['src/transforms/__testfixtures__/**/*'],
});
