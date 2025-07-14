// @ts-check

/**
 * @typedef {'win32' | 'ios' | 'android' | 'windows' | 'macos' } AllPlatforms
 * @typedef {'default' | AllPlatforms} PlatformValue
 * @typedef {Record<PlatformValue, string>} RnVersions
 */

const _defaultPlatform = 'default';
const _defaultVersion = 'react-native';

/** @type {Record<PlatformValue, string>} */
const _rnVersions = {
  default: _defaultVersion,
  android: _defaultVersion,
  ios: _defaultVersion,
  macos: 'react-native-macos',
  win32: '@office-iss/react-native-win32',
  windows: 'react-native-windows',
};

/**
 * Find the platform from the command line arguments.
 * @param {PlatformValue} [toSet] - Optional platform value to override the args.
 * @returns {PlatformValue | undefined} - The found platform or undefined.
 */
export function findPlatformFromArgv(toSet) {
  const platformValueIndex = process.argv.indexOf('--platform') + 1;
  if (platformValueIndex > 0 && platformValueIndex < process.argv.length) {
    if (toSet) {
      process.argv[platformValueIndex] = toSet;
    }
    const platformArg = process.argv[platformValueIndex];
    if (platformArg && Object.prototype.hasOwnProperty.call(_rnVersions, platformArg)) {
      const typedValue = /** @type {PlatformValue} */ (platformArg);
      return typedValue;
    }
  }
  return undefined;
}

export function findPlatform() {
  return findPlatformFromArgv() || _defaultPlatform;
}

/**
 * Ensure the platform is set from the command line arguments or defaults.
 * @param {PlatformValue} [platform]
 * @param {PlatformValue} [defaultOverride]
 * @returns {PlatformValue}
 */
export function ensurePlatform(platform, defaultOverride) {
  const found = findPlatformFromArgv(platform);
  platform = found || platform;
  if (platform && !found) {
    process.argv.push('--platform', platform);
  }
  return platform || defaultOverride || _defaultPlatform;
}
