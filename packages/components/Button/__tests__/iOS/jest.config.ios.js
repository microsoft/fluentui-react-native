const { configureReactNativeJest } = require('@fluentui-react-native/scripts');
module.exports = configureReactNativeJest('ios', {
  roots: ['.'],
  testRegex: '(.*|\\.(test|spec))\\.(ts|tsx)$',
});
