import type { StorybookConfig } from '@storybook/react-native';

/**
 * Storybook configuration for the agentic-components on-device app.
 *
 * Stories are loaded from the sibling agentic library and standalone native packages
 * that are linked into this application. The globs are relative to this config directory
 * (`apps/storybook/src`).
 */
const main: StorybookConfig = {
<<<<<<< HEAD
  stories: [
    '../../../packages/agentic-components/src/**/*.stories.?(ts|tsx)',
    '../../../packages/native/Callout/src/**/*.stories.?(ts|tsx)',
  ],
||||||| 853f1fd1d
  stories: ['../../src/**/*.stories.?(ts|tsx)', '../../../native/Callout/src/**/*.stories.?(ts|tsx)'],
=======
  stories: [
    '../../../packages/agentic-components/src/**/*.stories.?(ts|tsx)',
    '../../../packages/native/callout/src/**/*.stories.?(ts|tsx)',
  ],
>>>>>>> 29f00b3223cfa916b30552f546b32c45308d0c04
  addons: [],
  deviceAddons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
};

export default main;
