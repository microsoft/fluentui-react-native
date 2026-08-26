const path = require('node:path');
const { startDesktopStorybookServer } = require('@fluentui-react-native/storybook-desktop/server');

startDesktopStorybookServer({
  configPath: path.resolve(__dirname, 'src'),
});
