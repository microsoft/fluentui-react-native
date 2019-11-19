/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
// @ts-check
const fs = require('fs');
const path = require('path');
const blacklist = require('metro-config/src/defaults/blacklist');
const getAllPackageInfo = require('../../scripts/monorepo/getAllPackageInfo');

// Helper function to get the real path to a symlinked package by searching for its package.json
const pathToSymLinkedPackage = package => fs.realpathSync(path.resolve(require.resolve(package + '/package.json'), '..'));

// Get an array of all packages under repo-root/packages
const allPackages = getAllPackageInfo();
const uifabricsharedPackages = Object.keys(allPackages).reduce(
  (prev, key) => (allPackages[key].packagePath.startsWith('packages') ? [...prev, key] : prev),
  []
);

const additionalWatchFolders = uifabricsharedPackages.map(package => pathToSymLinkedPackage(package));
const extraNodeModules = uifabricsharedPackages.reduce((o, key) => ({ ...o, [key]: require.resolve(key) }), {});

// We could generalize the blacklistRE, too, if more packages start depending on 'react-native'.  For now this path is a one off.
const themingPath = pathToSymLinkedPackage('@uifabricshared/theming-react-native');
const themedStylsheetPath = pathToSymLinkedPackage('@uifabricshared/themed-stylesheet');

module.exports = {
  // WatchFolders is only needed due to the yarn workspace layout of node_modules, we need to watch the symlinked locations separately
  watchFolders: [
    // Include hoisted modules
    path.resolve(__dirname, '../..', 'node_modules'),
    ...additionalWatchFolders
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
