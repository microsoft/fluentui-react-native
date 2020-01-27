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

module.exports = {
  // WatchFolders is only needed due to the yarn workspace layout of node_modules, we need to watch the symlinked locations separately
  watchFolders: [
    // Include hoisted modules
    path.resolve(__dirname, '../..', 'node_modules'),
    path.resolve(__dirname, '../..', 'node_modules/@office-iss/react-native-win32'),
    ...additionalWatchFolders
  ],

  resolver: {
    extraNodeModules: {
      'react-native': path.resolve(__dirname, '../../node_modules/@office-iss/react-native-win32')
    },
    blacklistRE: blacklist([
      new RegExp(`${path.resolve('../..', 'node_modules/react-native').replace(/[/\\\\]/g, '[/\\\\]')}.*`),
      new RegExp(
        `${path.resolve('../..', 'node_modules/@office-iss/react-native-win32/node_modules/react-native').replace(/[/\\\\]/g, '[/\\\\]')}.*`
      ),
      new RegExp(`${path.resolve('.', 'node_modules/react-native').replace(/[/\\\\]/g, '[/\\\\]')}.*`)
    ]),
    hasteImplModulePath: path.resolve('../..', 'node_modules/@office-iss/react-native-win32/jest/hasteImpl.js'),
    platforms: ['win32', 'ios', 'android', 'windows', 'web', 'macos'],
    providesModuleNodeModules: ['@office-iss/react-native-win32']
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false
      }
    })
  },
  resetCache: false
};
