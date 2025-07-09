// @ts-check

// @ts-ignore-line the preset doesn't contain typing information
import jestPreset from '@rnx-kit/jest-preset';
import path from 'path';
import { getPackageInfos } from 'workspace-tools';
import { mergeConfigs } from './mergeConfigs';
import { ensurePlatform } from '../utils/platforms';
import { nodeModulesToRoot } from '../utils/resolvePaths';

/**
 * @typedef {import('jest').Config} JestConfig
 */

const moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json'];

/**
 * @param {JestConfig} [customConfig]
 * @returns {JestConfig} - The Jest configuration object.
 */
export function configureJest(customConfig) {
  const pkgInfo = getPackageInfos(process.cwd());

  /** @type {JestConfig} */
  const baseConfig = {
    // run tests from the src directory rather than lib
    roots: ['<rootDir>/src'],

    // map specific modules to the appropriate mocks
    moduleNameMapper: {
      '\\.(scss)$': path.resolve(__dirname, 'jest/jest-style-mock.js'),
      KeyCodes: path.resolve(__dirname, 'jest/jest-mock.js'),
      // Jest is picking up the hoisted version of lru-cache, which is
      // incompatible from the version required by semver
      'lru-cache': require.resolve('lru-cache', { paths: [require.resolve('semver')] }),
    },
    moduleFileExtensions,
    moduleDirectories: nodeModulesToRoot(),

    // use babel-jest to transform files including typescript
    transform: {
      '^.+\\.(js|ts|tsx)?$': 'babel-jest',
    },

    // ignore our own packages in node_modules
    transformIgnorePatterns: Object.keys(pkgInfo).map((pkg) => '/node_modules/' + pkg),

    // testRegex for which files to consider test files
    testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$',
    testEnvironmentOptions: { url: 'http://localhost' },

    verbose: false,
  };

  return customConfig ? mergeConfigs(baseConfig, customConfig) : baseConfig;
}

/**
 *
 * @param {import('../utils/platforms').PlatformValue} [platform]
 * @param {JestConfig} [customConfig]
 * @returns {JestConfig}
 */
export function configureReactNativeJest(platform, customConfig) {
  return jestPreset(ensurePlatform(platform, 'ios'), {
    roots: ['<rootDir>/src'],
    verbose: false,
    ...customConfig,
  });
}
