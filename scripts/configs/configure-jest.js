// @ts-check
'use strict';

const path = require('path');
const merge = require('../utils/merge');
const { getPackageNames } = require('../utils/package-info');
const { chainToRoot } = require('../utils/file-paths');

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
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      moduleDirectories: chainToRoot().map(dir => dir + '/node_modules'),

      // reporter to suppress detailed logging, worth considering whether this can be switched via a verbose flag
      reporters: [path.resolve(__dirname, './jest/jest-reporter.js')],

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
  return configureJest(
    merge(
      {
        preset: 'react-native'
      },
      customConfig
    )
  );
}

exports.configureReactNativeJest = configureReactNativeJest;
