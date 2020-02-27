const path = require('path');
const merge = require('../tasks/merge');
const resolve = require('resolve');
const { resolveCwd } = require('just-scripts');

module.exports = {
  createRawConfig: () => ({
    rootDir: 'lib',
    testRegex: '(/__tests__/.*|\\.(test|spec))\\.js$'
  }),
  createConfig: customConfig =>
    merge(
      {
        roots: ['<rootDir>/src'],

        moduleNameMapper: {
          '\\.(scss)$': path.resolve(__dirname, 'jest-style-mock.js'),
          KeyCodes: path.resolve(__dirname, 'jest-mock.js')
        },

        transform: {
          '^.+\\.(js|ts|tsx)?$': 'babel-jest'
        },

        transformIgnorePatterns: ['/node_modules/(?!(@uifabricshared)/).*/', '/node_modules/(?!(@fluentui-native)/).*/'],

        reporters: [path.resolve(__dirname, './jest-reporter.js')],

        testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$',
        moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

        setupFiles: [path.resolve(__dirname, 'jest-setup.js')],

        moduleDirectories: ['node_modules', path.resolve(process.cwd(), 'node_modules'), path.resolve(__dirname, '../node_modules')],

        testURL: 'http://localhost'
      },
      customConfig
    )
};
