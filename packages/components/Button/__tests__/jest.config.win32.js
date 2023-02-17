const { configureReactNativeJest } = require('@fluentui-react-native/scripts');
module.exports = configureReactNativeJest('win32', {
  roots: ['.'],
  snapshotResolver: './win32/snapshotResolver.js',
  testRegex: '(.*|\\.(test|spec))\\.(ts|tsx)$',
});
