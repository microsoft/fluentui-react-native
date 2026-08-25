import type { StorybookConfig } from '@storybook/react-native';

/**
 * Storybook configuration for the agentic-components on-device app.
 *
 * Stories are loaded from the sibling agentic library and standalone native packages
 * that are linked into this application.
 */
const stories =
  process.env.STORYBOOK_PLATFORM === 'win32'
    ? [
        '../../../packages/agentic/components/src/primitives/**/*.stories.?(ts|tsx)',
        '../../../packages/agentic/components/src/components/!(accordion|list-item)/**/*.stories.?(ts|tsx)',
        '../../../packages/native/Callout/src/**/*.stories.?(ts|tsx)',
      ]
    : ['../../../packages/agentic/components/src/**/*.stories.?(ts|tsx)', '../../../packages/native/Callout/src/**/*.stories.?(ts|tsx)'];

const main: StorybookConfig = {
  stories,
  addons: [],
  deviceAddons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
};

export default main;
