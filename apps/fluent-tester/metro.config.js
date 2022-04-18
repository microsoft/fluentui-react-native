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
  /.*\/apps\/(?:win32)\/.*/,
  // Exclude build output directory
  /.*\/apps\/fluent-tester\/dist\/.*/,
]);

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();
  return {
    watchFolders: defaultWatchFolders(__dirname),
    resolver: {
      assetExts: [...assetExts.filter((ext) => ext !== 'svg'), 'ttf', 'otf', 'png'],
      sourceExts: [...sourceExts, 'svg'],
      blacklistRE: blockList,
      blockList,
    },
    transformer: {
      // This transformer selects between the regular transformer and svg transformer depending on the file type
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
