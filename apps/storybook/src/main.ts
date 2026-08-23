import { toStorybookStories } from '@fluentui-react-native/desktop-driver/config';
import type { StorybookConfig } from '@storybook/react-native';

import desktopConfig from '../desktop.config.ts';

/**
 * Storybook configuration for the agentic-components on-device app.
 *
 * Stories are loaded from the sibling agentic library and standalone native packages
 * that are linked into this application. The globs are relative to this config directory
 * (`apps/storybook/src`).
 */
const main: StorybookConfig = {
  stories: toStorybookStories(desktopConfig),
  addons: [],
  deviceAddons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
};

export default main;
