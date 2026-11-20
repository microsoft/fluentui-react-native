const config = require('@fluentui-react-native/scripts/jest-config');
const { testBudget } = require('@fluentui-react-native/scripts/test-budget');

module.exports = {
  ...config,
  testTimeout: testBudget(10_000),
};
