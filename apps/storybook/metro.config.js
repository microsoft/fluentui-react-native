const path = require('node:path');
const { createDesktopStorybookMetroConfig } = require('@fluentui-react-native/storybook-desktop/metro');

module.exports = createDesktopStorybookMetroConfig({
  configPath: path.resolve(__dirname, 'src'),
});
