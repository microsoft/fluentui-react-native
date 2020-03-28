'use strict';

import path from 'path';
import { mergeConfigs } from './mergeConfigs';
import { getPackageInfo } from 'just-repo-utils';
import { nodeModulesToRoot, resolveModule } from './resolvePaths';
import { getRNVersion, getAllPlatforms } from './platforms';

const moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json'];

export function configureJest(customConfig) {
  const pkgInfo = getPackageInfo();
  return mergeConfigs(
    {
      // run tests from the src directory rather than lib
      roots: ['<rootDir>/src'],

      // map specific modules to the appropriate mocks
      moduleNameMapper: {
        '\\.(scss)$': path.resolve(__dirname, 'jest/jest-style-mock.js'),
        KeyCodes: path.resolve(__dirname, 'jest/jest-mock.js')
      },
      moduleFileExtensions,
      moduleDirectories: nodeModulesToRoot(),

      snapshotSerializers: ['enzyme-to-json/serializer'],

      // use babel-jest to transform files including typescript
      transform: {
        '^.+\\.(js|ts|tsx)?$': 'babel-jest'
      },

      // ignore our own packages in node_modules
      transformIgnorePatterns: pkgInfo.names().map(pkg => '/node_modules/' + pkg),

      // testRegex for which files to consider test files
      testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$',
      testURL: 'http://localhost',

      verbose: false

      // some options which have been removed (but saved here for posterity/easy re-adding)
      // setupFiles: [path.resolve(__dirname, 'jest-setup.js')],
    },
    customConfig
  );
}

export function configureReactNativeJest(platform, customConfig) {
  platform = platform || 'ios';
  const rnPackage = getRNVersion(platform);
  const rnPath = resolveModule(rnPackage);

  console.log(__dirname);
  return configureJest(
    mergeConfigs(
      {
        preset: 'react-native',
        roots: [rnPath, '<rootDir>/src'],
        haste: {
          defaultPlatform: platform,
          platforms: getAllPlatforms(),
          hasteImplModulePath: rnPath + '/jest/hasteImpl.js',
          providesModuleNodeModules: [rnPackage]
        },
        moduleNameMapper: {
          '^react-native$': rnPath + '/',
          '^react-native/(.*)': rnPath + '/$1'
        },
        modulePathIgnorePatterns: [
          '<rootDir>/../../src/react-native/Libraries/react-native/',
          '<rootDir>/../../src/react-native/node_modules/',
          '<rootDir>/../../src/react-native/packager/',
          'react-native-win32/src/.*',
          'react-native-win32/lib/.*.d.ts',
          'react-native-windows/src/Libraries/.*',
          'react-native-windows/lib/.*.d.ts',
          'lib-amd/.*'
        ],
        setupFiles: [path.resolve(__dirname, 'jest/jest-setup-enzyme.js')],
        ...(platform && {
          moduleFileExtensions: [...moduleFileExtensions.map(v => `${platform}.${v}`), ...moduleFileExtensions],
          testRegex: `(/__tests__/.*|\\.(test|spec))(\\.${platform})?\\.(ts|tsx)$`
        })
      },
      customConfig
    )
  );
}
