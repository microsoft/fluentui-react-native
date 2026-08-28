const config = require('@fluentui-react-native/scripts/jest-config');

module.exports = {
  ...config,
  moduleNameMapper: {
    ...config.moduleNameMapper,
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
