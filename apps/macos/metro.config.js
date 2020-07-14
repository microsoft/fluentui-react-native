/**
 * This cli config is needed for development purposes, e.g. for running
 * integration tests during local development or on CI services.
 */

const path = require('path');
const blacklist = require('metro-config/src/defaults/blacklist');
const {getWatchFolders} = require('@uifabricshared/build-native');

const rnmPath = path.dirname(require.resolve('react-native-macos/package.json'));

module.exports = {
  watchFolders: getWatchFolders(),
  resolver: {
    extraNodeModules: {
      'react-native': rnmPath,
    },
    platforms: ['macos', 'ios'],
    blacklistRE: blacklist([/node_modules\/react-native\/.*/]),
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
};
