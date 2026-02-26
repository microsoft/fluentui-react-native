const path = require('node:path');
const { makeMetroConfig, exclusionList } = require('@rnx-kit/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');

// ensure regex paths are merged, normalized, use forward slashes and end with a /
function pathForRegex(...parts) {
  let result = path.normalize(path.join(...parts));
  if (!result.endsWith(path.sep)) {
    result += path.sep;
  }
  return result.replace(/[/\\]+/g, '/');
}

const blockList = exclusionList([
  // Exclude other test apps
  new RegExp(pathForRegex(__dirname, '../win32')),
  new RegExp(pathForRegex(__dirname, '../win32-81')),
  new RegExp(pathForRegex(__dirname, '../fluent-tester')),
  // Exclude build output directory
  new RegExp(pathForRegex(__dirname, 'dist')),
]);

const config = makeMetroConfig({
  resolver: {
    blockList,
    resolveRequest: MetroSymlinksResolver({
      resolver: 'oxc-resolver',
    }),
    // unstable_conditionNames: ['import', 'require'],
    disableHierarchicalLookup: true,
    enableSymlinks: true,
  },
  transformer: {
    // This transformer selects between the regular transformer and svg transformer depending on the file type
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
});

config.resolver.assetExts = [...config.resolver.assetExts.filter((ext) => ext !== 'svg'), 'ttf', 'otf', 'png'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
