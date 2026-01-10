// @ts-check

// @ts-expect-error no types available for jest-preset
import jestPreset from '@rnx-kit/jest-preset';
import { ensurePlatform } from './platforms.js';
import { isPnpmMode } from '@fluentui-react-native/scripts';

/**
 * @typedef {import('jest').Config} JestConfig
 */

/**
 *
 * @param {import('./platforms.js').PlatformValue} [platform]
 * @param {JestConfig} [customConfig]
 * @returns {JestConfig}
 */
export function configureReactNativeJest(platform, customConfig) {
  const config = jestPreset(ensurePlatform(platform, 'ios'), {
    roots: ['<rootDir>/src'],
    verbose: false,
    ...customConfig,
  });
  if (isPnpmMode()) {
    // In pnpm mode, we need to ensure that the transformIgnorePatterns
    // are set correctly to avoid issues with hoisted packages.
    config.transformIgnorePatterns = [
      '/node_modules/.store/(?!((jest-)?react-native(-macos)?|@react-native(-community)?|@office-iss-react-native-win32|@?react-native-windows))',
    ];
  }
  return config;
}
