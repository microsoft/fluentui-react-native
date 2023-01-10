const { configureReactNativeJest } = require('@fluentui-react-native/scripts');
module.exports = configureReactNativeJest('ios', { roots: ['..'], testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$' });
