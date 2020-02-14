// @ts-check

function prepareRegex(blacklistPath) {
  return new RegExp(`${blacklistPath.replace(/[/\\\\]/g, '[/\\\\]')}.*`);
}

module.exports = {
  configureMetro: function(options) {
    const { bundleName = 'anonymous', platforms = [] } = options;
    const win32 = Array.isArray(platforms) ? platforms.find(p => p === 'win32') : platforms === 'win32';

    const path = require('path');
    const { getPackagePaths, resolveModule, resolveFile } = require('../utils/queryFiles');
    const blacklist = require('metro-config/src/defaults/blacklist');
    const rnWin32Path = resolveModule('@office-iss/react-native-win32');
    const rnPath = resolveModule('react-native');

    return {
      // WatchFolders is only needed due to the yarn workspace layout of node_modules, we need to watch the symlinked locations separately
      watchFolders: [
        // Include hoisted modules
        path.resolve(__dirname, '../..', 'node_modules'),
        rnWin32Path,
        ...getPackagePaths()
      ],
      serializer: {
        getPolyfills: () => {
          return [
            resolveFile('@office-iss/react-native-win32/Libraries/polyfills/console.js'),
            resolveFile('@office-iss/react-native-win32/Libraries/polyfills/error-guard.js'),
            resolveFile('@office-iss/react-native-win32/Libraries/polyfills/Object.es7.js')
          ];
        }
      },
      resolver: {
        extraNodeModules: { 'react-native': rnWin32Path },
        blacklistRE: blacklist([
          /node_modules\/react-native\/.*/,
          /node_modules\/.*\/node_modules\/react-native\/.*/,
          prepareRegex(rnPath),
          prepareRegex(rnWin32Path + '/node_modules/react-native'),
          prepareRegex(path.resolve('.', 'node_modules/react-native')),
          prepareRegex(path.resolve('.', 'node_modules/@office-iss/react-native-win32'))
        ]),
        hasteImplModulePath: resolveFile('@office-iss/react-native-win32/jest/hasteImpl.js'),
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
  }
};
