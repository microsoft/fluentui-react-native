const baseConfig = require('@fluentui-react-native/eslint-config-rules');

module.exports = [
  ...baseConfig,
  {
    ignores: ['src/transforms/__testfixtures__/**/*'],
  },
];
