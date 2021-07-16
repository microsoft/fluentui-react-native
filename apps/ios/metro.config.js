/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const { defaultWatchFolders, exclusionList } = require('@rnx-kit/metro-config');
const { getDefaultConfig } = require('metro-config');

const blockList = exclusionList([
  // Exclude other test apps
  /.*\/apps\/(?:android|macos|web|win32|windows)\/.*/,
  // Exclude build output directory
  /.*\/apps\/ios\/dist\/.*/,
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
