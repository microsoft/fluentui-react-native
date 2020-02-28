import { getPackagePaths, resolveModule, resolveFile } from '../utils/queryFiles';

export type PlatformValue = 'win32' | 'ios' | 'android' | 'windows' | 'web' | 'macos';

export interface IMetroOptions {
  /**
   * bundle name, potentially used to keep caches distinct
   */
  bundle?: string;

  /**
   * which platforms should this bundle target, either a single string or an array
   */
  platform?: PlatformValue;
}

function prepareRegex(blacklistPath: string) {
  return new RegExp(`${blacklistPath.replace(/[/\\\\]/g, '[/\\\\]')}.*`);
}

const _platformFlags: { [K in PlatformValue]?: { rnOverride: string } } = {
  win32: { rnOverride: '@office-iss/react-native-win32' },
  windows: { rnOverride: 'react-native-windows' }
};

/**
 * This configures metro bundling based on the passed in options.
 *
 * @param options - metro configuration options
 */
export function configureMetro(options: IMetroOptions): any {
  const { platform = 'iOS' } = options;
  const rnOverride: string = platform && _platformFlags[platform] && _platformFlags[platform].rnOverride;

  const path = require('path');
  const blacklist = require('metro-config/src/defaults/blacklist');
  const rnPath = resolveModule('react-native');
  const rnName = rnOverride || 'react-native';
  const rnPlatformPath = (rnOverride && resolveModule(rnOverride)) || rnPath;

  return {
    // WatchFolders is only needed due to the yarn workspace layout of node_modules, we need to watch the symlinked locations separately
    watchFolders: [
      // Include hoisted modules
      path.resolve(__dirname, '../..', 'node_modules'),
      rnPlatformPath,
      ...getPackagePaths()
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
      platforms: ['win32', 'ios', 'android', 'windows', 'web', 'macos'],
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
