// @ts-check
'use strict';

const path = require('path');
const { resolveModule, resolveFile } = require('../utils/file-paths');
const { getAllRNVersions, getRNVersion, ensurePlatform, getAllPlatforms } = require('./platforms');
const { getPackageInfo, findGitRoot, normalizeToUnixPath } = require('just-repo-utils');

function prepareRegex(blacklistPath) {
  return new RegExp(`${blacklistPath.replace(/[/\\\\]/g, '\\/')}.*`);
}

function getBlacklistRE(platform) {
  console.log(`Blacklist platform is ${platform}`);

  const blacklist = require('metro-config/src/defaults/blacklist');
  const versions = getAllRNVersions();
  const thisVersion = getRNVersion(platform);

  const rootPath = normalizeToUnixPath(findGitRoot());
  const cwdPath = normalizeToUnixPath(process.cwd());

  return blacklist([
    //      /node_modules\/react-native\/.*/,
    //      /node_modules\/.*\/node_modules\/react-native\/.*/,
    ...versions.filter(ver => ver !== thisVersion).map(ver => prepareRegex(rootPath + `/node_modules/${ver}/`)),
    ...versions.map(ver => prepareRegex(cwdPath + `/node_modules/${ver}/`))
  ]);
}

/**
 * This configures metro bundling based on the passed in options.
 *
 * @param options - metro configuration options
 */
function configureMetro(options) {
  const platform = ensurePlatform(options && options.platform);
  const rnPath = resolveModule('react-native');
  const rnName = getRNVersion(platform);
  const rnOverride = rnName !== 'react-native' && rnName;
  const rnPlatformPath = (rnOverride && resolveModule(rnOverride)) || rnPath;
  const dependencies = getPackageInfo({ strategy: 'update' }).dependencies();
  console.log(`Platform is ${platform}`);

  return {
    // WatchFolders is only needed due to the yarn workspace layout of node_modules, we need to watch the symlinked locations separately
    watchFolders: [
      // Include hoisted modules
      rnPlatformPath,
      path.resolve(__dirname, '../..', 'node_modules'),
      ...dependencies.paths()
    ],
    serializer: {
      getModulesRunBeforeMainModule: () => [require.resolve(path.join(rnPlatformPath, 'Libraries/Core/InitializeCore'))],
      getPolyfills: () => {
        return [
          resolveFile(rnName + '/Libraries/polyfills/console.js'),
          resolveFile(rnName + '/Libraries/polyfills/error-guard.js'),
          resolveFile(rnName + '/Libraries/polyfills/Object.es7.js')
        ];
      }
    },
    resolver: {
      resolverMainFields: ['react-native', 'browser', 'main'],
      extraNodeModules: { 'react-native': rnPlatformPath },
      blacklistRE: getBlacklistRE(platform),
      hasteImplModulePath: rnPlatformPath + '/jest/hasteImpl.js',
      platforms: getAllPlatforms(),
      providesModuleNodeModules: [rnName]
    },
    transformer: {
      babelTransformPath: require.resolve('metro-react-native-babel-transformer'),
      assetRegistryPath: path.join(rnPlatformPath, 'Libraries/Image/AssetRegistry'),
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
