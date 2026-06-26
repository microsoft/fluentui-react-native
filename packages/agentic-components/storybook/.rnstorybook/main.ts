import type { StorybookConfig } from '@storybook/react-native';

/**
 * Storybook configuration for the agentic-components on-device app.
 *
 * Stories are loaded directly from the sibling library source (`../../src`) so any
 * `*.stories.(ts|tsx)` added to a component automatically shows up here.
 */
const main: StorybookConfig = {
  stories: ['../../src/**/*.stories.?(ts|tsx)'],
  addons: [],
  deviceAddons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
};

export default main;
