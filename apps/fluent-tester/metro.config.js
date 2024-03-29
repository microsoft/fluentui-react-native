/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path');
const { exclusionList, makeMetroConfig, resolveUniqueModule } = require('@rnx-kit/metro-config');

const [reactIs, reactIsExcludePattern] = resolveUniqueModule('react-is');

const blockList = exclusionList([
  /node_modules\/.*\/node_modules\/react-native\/.*/,

  // This stops "react-native run-windows" from causing the metro server to
  // crash if its already running
  new RegExp(`${path.join(__dirname, 'windows').replace(/[/\\]+/g, '/')}.*`),

  // Workaround for `EPERM: operation not permitted, lstat '~\midl-MIDLRT-cl.read.1.tlog'`
  /.*\.tlog/,

  // Prevent Metro from watching temporary files generated by Visual Studio
  // otherwise it may crash when they are removed when closing a project.
  /.*\/.vs\/.*/,

  // Workaround for `EBUSY: resource busy or locked, open '~\msbuild.ProjectImports.zip'`
  /.*\.ProjectImports\.zip/,

  // Exclude other test apps
  /.*\/apps\/(?:win32)\/.*/,

  // Exclude build output directory
  /.*\/apps\/fluent-tester\/dist\/.*/,

  reactIsExcludePattern,
]);

let config = makeMetroConfig({
  resolver: {
    blockList,
    extraNodeModules: {
      'react-is': reactIs,
    },
  },
  transformer: {
    // This transformer selects between the regular transformer and svg transformer depending on the file type
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
});

(config.resolver.assetExts = [...config.resolver.assetExts.filter((ext) => ext !== 'svg'), 'ttf', 'otf', 'png']),
  (config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg']),
  (module.exports = config);
