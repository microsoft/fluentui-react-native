// @ts-check
'use strict';

import path from 'path';
import { resolveModule, resolveFile } from './resolvePaths';
import { getAllRNVersions, getRNVersion, ensurePlatform, getAllPlatforms } from './platforms';
import { getPackageInfo, findGitRoot, normalizeToUnixPath } from 'just-repo-utils';
import { blacklist } from 'metro-config-60/src/defaults/blacklist';

function prepareRegex(blacklistPath): RegExp {
  return new RegExp(`${blacklistPath.replace(/[/\\\\]/g, '\\/')}.*`);
}

/**
 * The goal of the blacklist is to block all react-native locations from the haste map except the one blessed location.
 * @param rnPath - path to the allowed version of react native
 */
function getBlacklistRE(rnPath: string): RegExp {
  // get all react native package types in this repo (visible from this location)
  const locations = getAllRNVersions();
  const thisLocation = rnPath + '/';

  const rootPath = normalizeToUnixPath(findGitRoot());
  const cwdPath = normalizeToUnixPath(process.cwd());

  // now create an array with all locations, both hoisted to the root, and based in the current working directory
  const allPaths = [
    ...locations.map(pkgName => `${rootPath}/node_modules/${pkgName}/`),
    ...locations.map(pkgName => `${cwdPath}/node_modules/${pkgName}/`)
  ];

  // filter out the current valid location to ensure haste can find files there, then transform the remainder into
  // regular expressions for matching
  return blacklist([
    //      /node_modules\/react-native\/.*/,
    //      /node_modules\/.*\/node_modules\/react-native\/.*/,
    ...allPaths.filter(loc => loc !== thisLocation).map(loc => prepareRegex(loc))
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
      blacklistRE: getBlacklistRE(rnPlatformPath),
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
