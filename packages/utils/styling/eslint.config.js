const baseConfig = require('@fluentui-react-native/eslint-config-rules');

module.exports = [
  ...baseConfig,
  {
    rules: {
      '@typescript-eslint/no-var-requires': 0,
    },
  },
];
