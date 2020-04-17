// @ts-check
'use strict';

import path from 'path';
import { resolveModule, resolveFile } from './resolvePaths';
import { getRNVersion, getAllPlatforms, getAllReactNativePaths, PlatformValue, findPlatformFromArgv } from './platforms';
import { getPackageInfo, findGitRoot } from 'just-repo-utils';
import blacklist from 'metro-config-60/src/defaults/blacklist';
import { mergeConfigs } from './mergeConfigs';
import { getDefaultConfig } from 'metro-config-60';

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
export async function configureMetro(optionsToMerge?: object) {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  const options = {
    // WatchFolders is only needed due to the yarn workspace layout of node_modules, we need to watch the symlinked locations separately
    watchFolders: [path.resolve(findGitRoot(), 'node_modules'), ...getPackageInfo().dependencies().paths()],
    resolver: {
      resolverMainFields: ['react-native', 'browser', 'main'],
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg']
    },
    transformer: {
      babelTransformerPath: require.resolve('./transform-selector'),

      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false
        }
      })
    },
    resetCache: false
  };

  // decorate with platform bits if the cmd line has the platform info
  const platform = findPlatformFromArgv();
  if (platform) {
    addPlatformMetroConfig(platform, options);
  }

  return optionsToMerge ? mergeConfigs(options, optionsToMerge) : options;
}
