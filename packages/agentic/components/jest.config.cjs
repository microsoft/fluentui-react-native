const config = require('@fluentui-react-native/scripts/jest-config');

module.exports = {
  ...config,
  testTimeout: 10000,
  // `*.desktop.spec.ts` files are WebdriverIO story tests for the on-device Storybook app. They
  // need a live desktop session and are run by `@fluentui-react-native/desktop-driver`, not Jest.
  testPathIgnorePatterns: [...(config.testPathIgnorePatterns ?? []), '\\.desktop\\.spec\\.ts$'],
};
