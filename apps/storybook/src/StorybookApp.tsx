import { createDesktopStorybookApp } from '@fluentui-react-native/storybook-desktop';

import { view } from './storybook.requires';

const StorybookApp = createDesktopStorybookApp(view, {
  testIDPrefix: 'agentic-storybook',
});

export default StorybookApp;
