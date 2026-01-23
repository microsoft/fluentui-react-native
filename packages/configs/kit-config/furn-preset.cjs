const { presets } = require('@rnx-kit/align-deps');
const rnPresets = presets['microsoft/react-native'];

/** @typedef {import('@rnx-kit/align-deps').Preset} Preset */

const rn73preset = rnPresets['0.73'];
const rn74preset = rnPresets['0.74'];

const toolsPreset = {
  'tools-align-deps': {
    name: '@fluentui-react-native/kit-config',
    version: 'workspace:*',
    devOnly: true,
  },
  'tools-core': {
    name: '@fluentui-react-native/scripts',
    version: 'workspace:*',
    devOnly: true,
    capabilities: ['tools-align-deps'],
  },
  'tools-eslint': {
    name: '@fluentui-react-native/eslint-config-rules',
    version: 'workspace:*',
    devOnly: true,
    capabilities: ['tools-core'],
  },
  'tools-jest': {
    name: '@fluentui-react-native/jest-config',
    version: 'workspace:*',
    devOnly: true,
    capabilities: ['tools-core'],
  },
};

module.exports = {
  0.73: {
    ...rn73preset,
    ...toolsPreset,
    'core-win32': {
      name: '@office-iss/react-native-win32',
      version: '^0.73.0',
      capabilities: ['core'],
    },
  },
  0.74: {
    ...rn74preset,
    ...toolsPreset,
    'core-win32': {
      name: '@office-iss/react-native-win32',
      version: '^0.74.0',
      capabilities: ['core'],
    },
  },
};
