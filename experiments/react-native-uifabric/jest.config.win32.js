const { configureJest } = require('@uifabricshared/build-native');
module.exports = configureJest('win32', {
  setupFiles: [require.resolve('@uifabricshared/theming-react-native/jest/setup.js')]
});
