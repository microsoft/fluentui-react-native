import { createDesktopStorybookApp } from '@fluentui-react-native/storybook-desktop-runtime';

import { view } from './storybook.requires';

const StorybookApp = createDesktopStorybookApp(view, {
  testIDPrefix: 'agentic-storybook',
});

export default StorybookApp;
