// @ts-check
'use strict';

const { resolveModule, resolveFile } = require('../utils/file-paths');
const { getRNPackage, getAllPlatforms } = require('./platforms');
const { getDependentPackagePaths } = require('../just-repo-utils');

function prepareRegex(blacklistPath) {
  return new RegExp(`${blacklistPath.replace(/[/\\\\]/g, '[/\\\\]')}.*`);
}

/**
 * This configures metro bundling based on the passed in options.
 *
 * @param options - metro configuration options
 */
function configureMetro(options) {
  const platform = options && options.platform;
  const path = require('path');
  const blacklist = require('metro-config/src/defaults/blacklist');
  const rnPath = resolveModule('react-native');
  const rnName = getRNPackage(platform);
  const rnOverride = rnName !== 'react-native' && rnName;
  const rnPlatformPath = (rnOverride && resolveModule(rnOverride)) || rnPath;

  return {
    // WatchFolders is only needed due to the yarn workspace layout of node_modules, we need to watch the symlinked locations separately
    watchFolders: [
      // Include hoisted modules
      path.resolve(__dirname, '../..', 'node_modules'),
      rnPlatformPath,
      ...getDependentPackagePaths()
    ],
    serializer: {
      getPolyfills: () => {
        return [
          resolveFile(rnName + '/Libraries/polyfills/console.js'),
          resolveFile(rnName + '/Libraries/polyfills/error-guard.js'),
          resolveFile(rnName + '/Libraries/polyfills/Object.es7.js')
        ];
      }
    },
    resolver: {
      extraNodeModules: { 'react-native': rnPlatformPath },
      blacklistRE: blacklist([
        /node_modules\/react-native\/.*/,
        /node_modules\/.*\/node_modules\/react-native\/.*/,
        prepareRegex(rnPath),
        prepareRegex(rnPlatformPath + '/node_modules/react-native'),
        prepareRegex(path.resolve('.', 'node_modules/react-native')),
        prepareRegex(path.resolve('.', 'node_modules/@office-iss/react-native-win32'))
      ]),
      hasteImplModulePath: resolveFile(rnName + '/jest/hasteImpl.js'),
      platforms: getAllPlatforms(),
      providesModuleNodeModules: [rnName]
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

module.exports.configureMetro = configureMetro;
