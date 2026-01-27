/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('node:path');
const { exclusionList, makeMetroConfig, resolveUniqueModule } = require('@rnx-kit/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');

// ensure regex paths are merged, normalized, use forward slashes and end with a /
function pathForRegex(...parts) {
  let result = path.normalize(path.join(...parts));
  if (!result.endsWith(path.sep)) {
    result += path.sep;
  }
  return result.replace(/[/\\]+/g, '/');
}

const excludeMixins = [];
const extraNodeModules = {};

function ensureUniqueModule(moduleName) {
  const [nmEntry, excludePattern] = resolveUniqueModule(moduleName);
  excludeMixins.push(excludePattern);
  extraNodeModules[moduleName] = nmEntry;
}

// build up the added excludes and extraNodeModules
['react-native-svg'].forEach((moduleName) => ensureUniqueModule(moduleName));

const blockList = exclusionList([
  // Exclude other test apps
  new RegExp(pathForRegex(__dirname, '../win32')),

  // Exclude build output directory
  new RegExp(pathForRegex(__dirname, 'dist')),

  ...excludeMixins,
]);

let config = makeMetroConfig({
  resolver: {
    blockList,
    extraNodeModules,
    resolveRequest: MetroSymlinksResolver(),
  },
  transformer: {
    // This transformer selects between the regular transformer and svg transformer depending on the file type
    babelTransformerPath: require.resolve('./svgTransformer.js'),
  },
});

config.resolver.assetExts = [...config.resolver.assetExts.filter((ext) => ext !== 'svg'), 'ttf', 'otf', 'png'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
