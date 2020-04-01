// @ts-check
'use strict';

import path from 'path';
import { resolveModule, resolveFile } from './resolvePaths';
import { getRNVersion, getAllPlatforms, getAllReactNativePaths, PlatformValue } from './platforms';
import { getPackageInfo, findGitRoot } from 'just-repo-utils';
import blacklist from 'metro-config-60/src/defaults/blacklist';
import { mergeConfigs } from './mergeConfigs';

function prepareRegex(blacklistPath): RegExp {
  return new RegExp(`${blacklistPath.replace(/[/\\\\]/g, '\\/')}.*`);
}

/**
 * The goal of the blacklist is to block all react-native locations from the haste map except the one blessed location.
 * @param rnPath - path to the allowed version of react native
 */
function getBlacklistRE(rnPath: string): RegExp {
  // get all react native package types in this repo (visible from this location)
  const thisLocation = rnPath + '/';
  return blacklist([
    ...getAllReactNativePaths()
      .filter(loc => loc !== thisLocation)
      .map(p => prepareRegex(p))
  ]);
}

/**
 * This adds platform specific options to a metro configuration.  Note that this directly modifies the object because subtle
 * error can creep up with merging
 */
export function addPlatformMetroConfig(platform: PlatformValue, base: any = {}): object {
  const rnPath = resolveModule('react-native');
  const rnName = getRNVersion(platform);
  const rnOverride = rnName !== 'react-native' && rnName;
  const rnPlatformPath = (rnOverride && resolveModule(rnOverride)) || rnPath;

  base.watchFolders.push(rnPlatformPath);
  const resolver = (base.resolver = base.resolver || {});
  resolver.extraNodeModules = { 'react-native': rnPlatformPath };
  resolver.blacklistRE = getBlacklistRE(rnPlatformPath);
  resolver.hasteImplModulePath = rnPlatformPath + '/jest/hasteImpl.js';
  resolver.providesModuleNodeModules = [rnName];
  resolver.platforms = getAllPlatforms();

  const serializer = (base.serializer = base.serializer || {});
  serializer.getModulesRunBeforeMainModule = () => [require.resolve(path.join(rnPlatformPath, 'Libraries/Core/InitializeCore'))];
  serializer.getPolyfills = () => {
    return [
      resolveFile(rnName + '/Libraries/polyfills/console.js'),
      resolveFile(rnName + '/Libraries/polyfills/error-guard.js'),
      resolveFile(rnName + '/Libraries/polyfills/Object.es7.js')
    ];
  };

  base.transformer = base.transformer || {};
  base.transformer.assetRegistryPath = path.join(rnPlatformPath, 'Libraries/Image/AssetRegistry');

  return base;
}

/**
 * This configures metro bundling based on the passed in options.
 *
 * @param options - metro configuration options
 */
export function configureMetro(optionsToMerge?: object) {
  const options = {
    // WatchFolders is only needed due to the yarn workspace layout of node_modules, we need to watch the symlinked locations separately
    watchFolders: [
      path.resolve(findGitRoot(), 'node_modules'),
      ...getPackageInfo({ strategy: 'update' })
        .dependencies()
        .paths()
    ],
    resolver: {
      resolverMainFields: ['react-native', 'browser', 'main']
    },
    transformer: {
      babelTransformPath: require.resolve('metro-react-native-babel-transformer'),

      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false
        }
      })
    },
    resetCache: false
  };

  return optionsToMerge ? mergeConfigs(options, optionsToMerge) : options;
}
