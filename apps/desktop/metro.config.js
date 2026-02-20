const { makeMetroConfig } = require('@rnx-kit/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');

const config = makeMetroConfig({
  resolver: {
    resolveRequest: MetroSymlinksResolver({
      resolver: 'oxc-resolver',
    }),
  },
  transformer: {
    // This transformer selects between the regular transformer and svg transformer depending on the file type
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
});

config.resolver.assetExts = [...config.resolver.assetExts.filter((ext) => ext !== 'svg'), 'ttf', 'otf', 'png'];
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
