/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
// @ts-check
const { makeMetroConfig } = require('@rnx-kit/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');
const { getDefaultConfig } = require('metro-config');

module.exports = async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig(__dirname);

  return makeMetroConfig({
    resolver: {
      assetExts: [...assetExts.filter((ext) => ext !== 'svg'), 'ttf', 'otf', 'png'],
      sourceExts: [...sourceExts, 'svg'],
      resolveRequest: MetroSymlinksResolver(),
    },
    transformer: {
      // This transformer selects between the regular transformer and svg transformer depending on the file type
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
  });
};
