import type { StorybookConfig } from '@storybook/react-native';

/**
 * Storybook configuration for the agentic-components on-device app.
 *
 * Stories are loaded from the sibling agentic library and standalone native packages
 * that are linked into this application.
 */
const main: StorybookConfig = {
  stories: [
    '../../../packages/agentic-components/src/**/*.stories.?(ts|tsx)',
    '../../../packages/native/Callout/src/**/*.stories.?(ts|tsx)',
    '../../../packages/components/FocusZone/src/**/*.stories.?(ts|tsx)',
  ],
  addons: [],
  deviceAddons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
};

export default main;
