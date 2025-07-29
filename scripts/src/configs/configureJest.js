// @ts-check

// @ts-expect-error no types available for jest-preset
import jestPreset from '@rnx-kit/jest-preset';
import { ensurePlatform } from '../utils/platforms.js';

/**
 * @typedef {import('jest').Config} JestConfig
 */

/**
 * @param {JestConfig} [customConfig]
 * @returns {JestConfig} - The Jest configuration object.
 */
export function configureJest(customConfig) {
  return jestPreset(undefined, {
    roots: ['<rootDir>/src'],
    verbose: false,
    ...customConfig,
  });
}

/**
 *
 * @param {import('../utils/platforms.js').PlatformValue} [platform]
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
