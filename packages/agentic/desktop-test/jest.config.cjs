const config = require('@fluentui-react-native/scripts/jest-config');

module.exports = {
  ...config,
  transformIgnorePatterns: ['node_modules[/\\\\](?!.*\\.mjs$)'],
  moduleNameMapper: {
    ...config.moduleNameMapper,
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
