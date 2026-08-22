import * as path from 'node:path';

import type { StorybookConfig } from '@storybook/react-native';

import desktopConfig from '../desktop.config';

/**
 * Storybook configuration for the agentic-components on-device app.
 *
 * Stories are loaded from the sibling agentic library and standalone native packages
 * that are linked into this application. The globs are relative to this config directory
 * (`apps/storybook/src`).
 */
const main: StorybookConfig = {
  stories: desktopConfig.storybook.stories.map((entry) =>
    path.relative(desktopConfig.storybook.configDir, entry.directory).replaceAll(path.sep, '/').concat('/', entry.files),
  ),
  addons: [],
  deviceAddons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
};

export default main;
