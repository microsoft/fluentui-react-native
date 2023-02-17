const { configureReactNativeJest } = require('@fluentui-react-native/scripts');
module.exports = configureReactNativeJest('ios', {
  roots: ['.'],
  snapshotResolver: './ios/snapshotResolver.js',
  testRegex: '(.*|\\.(test|spec))\\.(ts|tsx)$',
});
