/**
 * This cli config is needed for development purposes, e.g. for running
 * integration tests during local development or on CI services.
 */

const { defaultWatchFolders, exclusionList } = require('@rnx-kit/metro-config');
const { getDefaultConfig } = require('metro-config');
const path = require('path');

const blockList = exclusionList([
  // Exclude other test apps
  /.*\/apps\/(?:android|ios|web|win32|windows)\/.*/,
  // Exclude build output directory
  /.*\/apps\/macos\/dist\/.*/,
]);

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();
  return {
    watchFolders: defaultWatchFolders(__dirname),
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      platforms: ['macos', 'ios'],
      blacklistRE: blockList,
      blockList,
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
