const path = require('node:path');

module.exports = {
  maxWorkers: 1,
  roots: [path.join(__dirname, 'windows-tests')],
  testEnvironment: '@react-native-windows/automation',
  testRegex: ['.*\\.test\\.cjs$'],
  testTimeout: 120000,
  verbose: true,
  testEnvironmentOptions: {
    app: process.env.STORYBOOK_WINDOWS_WINDOW_TITLE || 'Agentic Components Storybook',
    rootLaunchApp: false,
    useRootSession: true,
    winAppDriverBin: process.env.WINAPPDRIVERPATH,
    webdriverOptions: {
      connectionRetryCount: 5,
      connectionRetryTimeout: 30000,
      logLevel: 'error',
      waitforTimeout: 30000,
    },
  },
};
