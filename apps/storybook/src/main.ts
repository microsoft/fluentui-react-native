import type { DesktopReactNativeStorybookConfig } from '@fluentui-react-native/storybook-desktop/config';

import config from '../desktop.config.mts';

const storybookConfig: DesktopReactNativeStorybookConfig = config.integration.configure(config.projectRoot).getStorybookConfig();

export default storybookConfig;
