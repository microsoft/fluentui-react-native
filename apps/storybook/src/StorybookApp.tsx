import { createDesktopStorybookApp } from '@fluentui-react-native/storybook-desktop-runtime';

import appManifest from '../app.json';
import { view } from './storybook.requires';

const StorybookApp = createDesktopStorybookApp(view, { testIDPrefix: appManifest.storybook.testIDPrefix });

export default StorybookApp;
