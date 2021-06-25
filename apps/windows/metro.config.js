/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const exclusionList = (() => {
  try {
    return require("metro-config/src/defaults/exclusionList");
  } catch (_) {
    // `blacklist` was renamed to `exclusionList` in 0.60
    return require("metro-config/src/defaults/blacklist");
  }
})();

const blockList = exclusionList([
  /node_modules\/.*\/node_modules\/react-native\/.*/,

  // Workaround for `EBUSY: resource busy or locked, open '~\msbuild.ProjectImports.zip'`
  // when building with `yarn windows --release`
  /.*\.ProjectImports\.zip/,
]);

module.exports = {
  resolver: {
    blacklistRE: blockList,
    blockList,
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
