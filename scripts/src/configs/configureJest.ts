'use strict';

import path from 'path';
import { mergeConfigs } from './mergeConfigs';
import { getPackageInfo } from 'just-repo-utils';
import { nodeModulesToRoot, resolveModule } from '../utils/resolvePaths';
import { ensurePlatform, PlatformValue, getRNVersion, getAllPlatforms } from '../utils/platforms';

const moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json'];

export function configureJest(customConfig?: object): object {
  const pkgInfo = getPackageInfo();
  return mergeConfigs(
    {
      // run tests from the src directory rather than lib
      roots: ['<rootDir>/src'],

      // map specific modules to the appropriate mocks
      moduleNameMapper: {
        '\\.(scss)$': path.resolve(__dirname, 'jest/jest-style-mock.js'),
        KeyCodes: path.resolve(__dirname, 'jest/jest-mock.js'),
      },
      moduleFileExtensions,
      moduleDirectories: nodeModulesToRoot(),

      snapshotSerializers: ['enzyme-to-json/serializer'],

      // use babel-jest to transform files including typescript
      transform: {
        '^.+\\.(js|ts|tsx)?$': 'babel-jest',
      },

      // ignore our own packages in node_modules
      transformIgnorePatterns: pkgInfo.names().map(pkg => '/node_modules/' + pkg),

      // testRegex for which files to consider test files
      testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$',
      testURL: 'http://localhost',

      verbose: false,
    },
    customConfig,
  );
}

export function configureReactNativeJest(platform?: PlatformValue, customConfig?: object): object {
  platform = ensurePlatform(platform, 'ios');
  const rnPackage = getRNVersion(platform);
  const rnPath = resolveModule(rnPackage) + '/';
  console.log(rnPath);
  console.log(platform);
  console.log(require.resolve(rnPackage));

  return mergeConfigs(
    {
      roots: ['<rootDir>/src', rnPath],
      moduleFileExtensions,
      transform: {
        '^.+\\.(js|ts|tsx)?$': ['babel-jest', { cwd: __dirname, presets: ['module:metro-react-native-babel-preset'] }],
      },
      preset: 'react-native',
      moduleNameMapper: {
        '^react-native$': require.resolve(rnPackage),
        '^react-native/(.*)': rnPath + '$1',
      },
      haste: {
        defaultPlatform: platform,
        platforms: getAllPlatforms(),
        // hasteImplModulePath: rnPath + 'jest/hasteImpl.js',
        providesModuleNodeModules: [rnPackage],
      },
      transformIgnorePatterns: ['node_modules/(?!(react-native)/)'],
      verbose: false,
      setupFilesAfterEnv: [path.join(__dirname, './jest/setupEnzyme.js')],
    },
    customConfig,
  );
}
