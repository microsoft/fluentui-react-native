import type { KitConfig } from '@rnx-kit/types-kit-config';

const config: KitConfig = {
  kitType: 'library',
  alignDeps: {
    presets: [require.resolve('./furn-preset.cts')],
    requirements: {
      development: ['react-native@0.81'],
      production: ['react-native@0.73 || 0.74 || 0.78 || 0.81'],
    },
  },
};

module.exports = config;
