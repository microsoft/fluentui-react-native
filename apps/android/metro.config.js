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
  /.*\/apps\/(?:ios|macos|web|win32|windows)\/.*/,
  // Exclude build output directory
  /.*\/apps\/android\/dist\/.*/,
]);

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();
  return {
    watchFolders: defaultWatchFolders(__dirname),
    resolver: {
      // prettier-ignore
      assetExts: [assetExts.filter((ext) => ext !== 'svg'), 'ttf', 'otf', 'png'],
      sourceExts: [...sourceExts, 'svg'],
      blacklistRE: blockList,
      blockList,
    },
    // Metro doesn't currently handle assets coming from hoisted packages within a monorepo.  This is the current workaround people use
    // In this case this is to ensure that the image assets that are part of logbox get loaded correctly.
    server: {
      enhanceMiddleware: (middleware) => {
        return (req, res, next) => {
          if (req.url.startsWith('/fluent-tester/src')) {
            req.url = req.url.replace(
              '/fluent-tester/src',
              '/assets/../fluent-tester/src',
            );
          } else if (req.url.startsWith('/node_modules/react-native')) {
            req.url = req.url.replace(
              '/node_modules/react-native',
              '/assets/../../node_modules/react-native',
            );
          }
          return middleware(req, res, next);
        };
      },
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
