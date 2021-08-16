const { configureReactNativeJest } = require('@uifabricshared/build-native');
module.exports = configureReactNativeJest('android', {
  transform: {
    '^.+\\.(js|ts|tsx)?$': 'babel-jest',
    '^.+\\.svg$': '<rootDir>/svgTransform.js',
  },
});
