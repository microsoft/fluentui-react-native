const { configureReactNativeJest } = require('@uifabricshared/build-native');
module.exports = configureReactNativeJest('android', {
  moduleNameMapper: {
    '^.+\\.svg$': 'jest-svg-transformer',
  },
});
