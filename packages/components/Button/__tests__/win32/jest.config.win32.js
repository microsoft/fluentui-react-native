const { configureReactNativeJest } = require('@fluentui-react-native/scripts');
module.exports = configureReactNativeJest('win32', {
  roots: ['.'],
  testRegex: '(.*|\\.(test|spec))\\.(ts|tsx)$',
});
