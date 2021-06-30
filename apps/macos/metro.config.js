/**
 * This cli config is needed for development purposes, e.g. for running
 * integration tests during local development or on CI services.
 */

const path = require('path');
const blacklist = require('metro-config/src/defaults/blacklist');
const { getWatchFolders } = require('@uifabricshared/build-native');
const { getDefaultConfig } = require('metro-config');

const rnmPath = path.dirname(require.resolve('react-native-macos/package.json'));

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();
  return {
    watchFolders: getWatchFolders(),
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      extraNodeModules: {
        'react-native': rnmPath,
      },
      platforms: ['macos', 'ios'],
      blacklistRE: blacklist([/node_modules\/react-native\/.*/]),
    },
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
  };
})();
