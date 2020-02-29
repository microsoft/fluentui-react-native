// @ts-check
'use strict';

const path = require('path');
const merge = require('../utils/merge');
const { getPackageNames } = require('../utils/package-info');
const { chainToRoot, resolveModule } = require('../utils/file-paths');
const { getRNPackage, getAllPlatforms } = require('./platforms');

const moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json'];

function configureJest(customConfig) {
  return merge(
    {
      // run tests from the src directory rather than lib
      roots: ['<rootDir>/src'],

      // map specific modules to the appropriate mocks
      moduleNameMapper: {
        '\\.(scss)$': path.resolve(__dirname, 'jest/jest-style-mock.js'),
        KeyCodes: path.resolve(__dirname, 'jest/jest-mock.js')
      },
      moduleFileExtensions,
      moduleDirectories: chainToRoot().map(dir => dir + '/node_modules'),

      // reporter to suppress detailed logging, worth considering whether this can be switched via a verbose flag
      reporters: [path.resolve(__dirname, './jest/jest-reporter.js')],
      snapshotSerializers: ['enzyme-to-json/serializer'],

      // use babel-jest to transform files including typescript
      transform: {
        '^.+\\.(js|ts|tsx)?$': 'babel-jest'
      },

      // ignore our own packages in node_modules
      transformIgnorePatterns: getPackageNames().map(pkg => '/node_modules/' + pkg),

      // testRegex for which files to consider test files
      testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$',
      testURL: 'http://localhost'

      // some options which have been removed (but saved here for posterity/easy re-adding)
      // setupFiles: [path.resolve(__dirname, 'jest-setup.js')],
    },
    customConfig
  );
}

exports.configureJest = configureJest;

function configureReactNativeJest(platform, customConfig) {
  platform = platform || 'ios';
  const rnPackage = getRNPackage(platform);
  const rnPath = resolveModule(rnPackage);

  console.log(__dirname);
  return configureJest(
    merge(
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

exports.configureReactNativeJest = configureReactNativeJest;
