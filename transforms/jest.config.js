const { configureJest } = require('@fluentui-react-native/scripts');
module.exports = configureJest({ testRegex: '/__tests__/.*-test\\.js$' });
