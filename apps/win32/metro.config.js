/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const path = require('path');
const blacklist = require('metro-config/src/defaults/blacklist');
const { getWatchFolders } = require('@uifabricshared/build-native');
const { getDefaultConfig } = require('metro-config');


module.exports = (async () => {
    const {
        resolver: {
            sourceExts,
            assetExts
        }
    } = await getDefaultConfig();
    return {
        watchFolders: getWatchFolders(),
        resolver: {
          assetExts: assetExts.filter(ext => ext !== 'svg'),
          sourceExts: [
              ...sourceExts,
              'svg'
          ],
          resolveRequest: require('@office-iss/react-native-win32/metro-react-native-platform').reactNativePlatformResolver(
              {win32: '@office-iss/react-native-win32'}
          ),
          blacklistRE: blacklist([
              // This stops "react-native run-windows" from causing the metro server to crash if its already running
              new RegExp(`${path.resolve(__dirname, 'windows').replace(/[/\\]/g, '/')}.*`),
          ])
        },
        transformer: {
          // The cli defaults this to a full path to react-native, which bypasses the reactNativePlatformResolver above
          // Hopefully we can fix the default in the future
          assetRegistryPath: 'react-native/Libraries/Image/AssetRegistry',
          // This transformer selects between the regular transformer and svg transformer depending on the file type
          babelTransformerPath: require.resolve('react-native-svg-transformer'),
          getTransformOptions: async () => ({
              transform: {
                  experimentalImportSupport: false,
                  inlineRequires: false
              }
          })
        }
    };
})();
