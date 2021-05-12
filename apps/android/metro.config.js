/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const {getWatchFolders} = require('@uifabricshared/build-native');
const {getDefaultConfig} = require('metro-config');
const {
  TypeScriptValidation,
} = require('@rnx-kit/metro-plugin-typescript-validation');
const {MetroSerializer} = require('@rnx-kit/metro-serializer');

module.exports = (async () => {
  const {
    resolver: {sourceExts, assetExts},
  } = await getDefaultConfig();
  return {
    watchFolders: getWatchFolders(),
    resolver: {
      // prettier-ignore
      assetExts: [assetExts.filter((ext) => ext !== 'svg'), 'ttf', 'otf', 'png'],
      sourceExts: [...sourceExts, 'svg'],
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
    serializer: {
      customSerializer: MetroSerializer([TypeScriptValidation()]),
    },
  };
})();
