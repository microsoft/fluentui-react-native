const path = require('path');
const { makeMetroConfig, exclusionList } = require('@rnx-kit/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');

function pathForRegex(...parts) {
  let result = path.normalize(path.join(...parts));
  if (!result.endsWith(path.sep)) {
    result += path.sep;
  }
  return result.replace(/[/\\]+/g, '/');
}

const blockList = exclusionList([
  new RegExp(pathForRegex(__dirname, '../fluent-tester')),
  new RegExp(pathForRegex(__dirname, '../win32')),
  new RegExp(pathForRegex(__dirname, '../win32-81')),
  new RegExp(pathForRegex(__dirname, 'dist')),
]);

const config = makeMetroConfig({
  resolver: {
    blockList,
    resolveRequest: MetroSymlinksResolver({
      resolver: 'oxc-resolver',
    }),
    unstable_enablePackageExports: true,
    unstable_conditionNames: ['react-native', 'import', 'require'],
    disableHierarchicalLookup: true,
    enableSymlinks: true,
  },
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
});

config.resolver.assetExts = [...config.resolver.assetExts.filter((ext) => ext !== 'svg'), 'ttf', 'otf', 'png'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
