/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
// @ts-check
const { defaultWatchFolders, exclusionList, resolveUniqueModule, makeMetroConfig } = require('@rnx-kit/metro-config');
const { getDefaultConfig } = require('metro-config');

// const getPackages = require('get-monorepo-packages');
// const path = require('path');

// const packages = getPackages(path.resolve(__dirname, '../..'));

// console.log(JSON.stringify(packages), null, 2);

// const MetroSymlinkResolver = require('@rnx-kit/metro-resolver-symlinks');

const [reactIs, reactIsExcludePattern] = resolveUniqueModule('react-is');

const blockList = exclusionList([
  // Exclude build output directory
  /.*\/apps\/win32\/dist\/.*/,
  reactIsExcludePattern,
]);

module.exports = async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig(__dirname);

  return makeMetroConfig({
    resolver: {
      assetExts: [...assetExts.filter((ext) => ext !== 'svg'), 'ttf', 'otf', 'png'],
      sourceExts: [...sourceExts, 'svg'],
    },
    transformer: {
      // This transformer selects between the regular transformer and svg transformer depending on the file type
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
  });
};

/*
module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig(__dirname);
  return {
    watchFolders: defaultWatchFolders(),
    resolver: {
      assetExts: [...assetExts.filter((ext) => ext !== 'svg'), 'ttf', 'otf', 'png'],
      sourceExts: [...sourceExts, 'svg'],
      blacklistRE: blockList,
      blockList,
      extraNodeModules: {
        'react-is': reactIs,
      },
      // resolveRequest: MetroSymlinkResolver({
      //   experimental_retryResolvingFromDisk,
      //   remapModule: !usingPlatformBundle
      //     ? (_context, moduleName, _platform) => moduleName
      //     : (_context, moduleName, platform) => {
      //         if (!externals[platform]) {
      //           externals[platform] = getExternals(platform);
      //         }
      //         return redirectPlatformBundleImports(moduleName, platform, externals[platform]);
      //       },
      // }),
    },
    // Metro doesn't currently handle assets coming from hoisted packages within a monorepo.  This is the current workaround people use
    // In this case this is to ensure that the image assets that are part of logbox get loaded correctly.
    server: {
      enhanceMiddleware: (middleware) => {
        return (req, res, next) => {
          if (req.url !== '/onchange') console.log('Incoming req: ' + req.url);

          if (req.url.startsWith('/../node_modules/@office-iss/react-native-win32')) {
            req.url = req.url.replace(
              '/../node_modules/@office-iss/react-native-win32',
              '/assets/../../node_modules/@office-iss/react-native-win32',
            );
          }
          return middleware(req, res, next);
        };
      },
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

*/
