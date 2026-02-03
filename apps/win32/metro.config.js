/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
// @ts-check
const { exclusionList, makeMetroConfig, resolveUniqueModule } = require('@rnx-kit/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');
const { getDefaultConfig } = require('metro-config');

const excludeMixins = [];
const extraNodeModules = {};
function ensureUniqueModule(moduleName, excludeList, nodeModules) {
  const [nmEntry, excludePattern] = resolveUniqueModule(moduleName);
  excludeMixins.push(excludePattern);
  extraNodeModules[moduleName] = nmEntry;
}

// build up the added excludes and extraNodeModules
['react-native-svg'].forEach((moduleName) => ensureUniqueModule(moduleName));

module.exports = async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig(__dirname);

  return makeMetroConfig({
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
    transformer: {
      // This transformer selects between the regular transformer and svg transformer depending on the file type
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
  });
};
