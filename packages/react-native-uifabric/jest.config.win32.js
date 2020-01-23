let { createConfig } = require('@uifabricshared/build-native/jest/jest-resources');

module.exports = createConfig('win32', {
  setupFiles: [require.resolve('@uifabricshared/theming-react-native/jest/setup.js')]
});
