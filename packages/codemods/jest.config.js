const { configureJest } = require('@fluentui-react-native/jest-config');
module.exports = configureJest({ testRegex: '/__tests__/.*-test\\.ts$' });
