/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const { exclusionList, makeMetroConfig, resolveUniqueModule } = require('@rnx-kit/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');
const { getDefaultConfig } = require('metro-config');
const { MetroSerializer } = require('@rnx-kit/metro-serializer-esbuild');

const { sourceExts, assetExts } = getDefaultConfig.getDefaultValues().resolver;

const excludeMixins = [];
const extraNodeModules = {};
function ensureUniqueModule(moduleName, excludeList, nodeModules) {
  const [nmEntry, excludePattern] = resolveUniqueModule(moduleName);
  excludeMixins.push(excludePattern);
  extraNodeModules[moduleName] = nmEntry;
}

// build up the added excludes and extraNodeModules
['react-native-svg', '@office-iss/react-native-win32', 'react-native'].forEach((moduleName) => ensureUniqueModule(moduleName));

module.exports = makeMetroConfig({
  resolver: {
    assetExts: [...assetExts.filter((ext) => ext !== 'svg'), 'ttf', 'otf', 'png'],
    blockList: exclusionList(excludeMixins),
    extraNodeModules: {
      ...extraNodeModules,
    },
    sourceExts: [...sourceExts, 'svg'],
    resolveRequest: MetroSymlinksResolver({
      resolver: 'oxc-resolver',
    }),
  },
  serializer: {
    customSerializer: MetroSerializer(),
  },
  transformer: {
    // This transformer selects between the regular transformer and svg transformer depending on the file type
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
});
