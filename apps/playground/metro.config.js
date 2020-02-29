/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
// @ts-check

const path = require('path');
const blacklist = require('metro-config/src/defaults/blacklist');
const { getPackagePaths, getPackageNames, resolveModule } = require('@uifabricshared/build-native');

// Get an array of all packages under repo-root/packages
const extraNodeModules = getPackageNames().reduce((o, key) => ({ ...o, [key]: require.resolve(key) }), {});

// We could generalize the blacklistRE, too, if more packages start depending on 'react-native'.  For now this path is a one off.
const themingPath = resolveModule('@uifabricshared/theming-react-native');
const themedStylsheetPath = resolveModule('@uifabricshared/themed-stylesheet');

module.exports = {
  // WatchFolders is only needed due to the yarn workspace layout of node_modules, we need to watch the symlinked locations separately
  watchFolders: [
    // Include hoisted modules
    path.resolve(__dirname, '../..', 'node_modules'),
    ...getPackagePaths()
  ],

  resolver: {
    extraNodeModules,
    blacklistRE: blacklist([
      new RegExp(`${path.resolve(themingPath, 'node_modules/react-native').replace(/[/\\\\]/g, '[/\\\\]')}.*`),
      new RegExp(`${path.resolve(themedStylsheetPath, 'node_modules/react-native').replace(/[/\\\\]/g, '[/\\\\]')}.*`)
    ])
    // platforms: ['ios', 'android', 'windesktop', 'windows', 'web', 'macos'],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false
      }
    })
  }
};
