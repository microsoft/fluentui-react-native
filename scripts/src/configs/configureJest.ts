import jestPreset from '@rnx-kit/jest-preset';
import path from 'path';
import { getPackageInfos } from 'workspace-tools';
import { mergeConfigs } from './mergeConfigs';
import { ensurePlatform, PlatformValue } from '../utils/platforms';
import { nodeModulesToRoot } from '../utils/resolvePaths';

const moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json'];

export function configureJest(customConfig?: object): object {
  const pkgInfo = getPackageInfos(process.cwd());
  return mergeConfigs(
    {
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
    },
    customConfig,
  );
}

export function configureReactNativeJest(platform?: PlatformValue, customConfig?: object): object {
  return jestPreset(ensurePlatform(platform, 'ios'), {
    roots: ['<rootDir>/src'],
    verbose: false,
    ...customConfig,
  });
}
