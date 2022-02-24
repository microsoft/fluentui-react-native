export type AllPlatforms = 'win32' | 'ios' | 'android' | 'windows' | 'macos';
export type PlatformValue = AllPlatforms | 'default';

const _defaultPlatform = 'default';
const _defaultVersion = 'react-native';

const _rnVersions: { [key in PlatformValue]: string } = {
  default: _defaultVersion,
  android: _defaultVersion,
  ios: _defaultVersion,
  macos: 'react-native-macos',
  win32: '@office-iss/react-native-win32',
  windows: 'react-native-windows',
};

export function findPlatformFromArgv(toSet?: PlatformValue): PlatformValue | undefined {
  for (let index = 0; index < process.argv.length; index++) {
    if (process.argv[index] === '--platform') {
      if (toSet) {
        process.argv[index + 1] = toSet;
      }
      const platformArg = process.argv[index + 1];
      return platformArg && _rnVersions[platformArg] ? (platformArg as PlatformValue) : undefined;
    }
  }
  return undefined;
}

export function findPlatform(): PlatformValue {
  return findPlatformFromArgv() || _defaultPlatform;
}

export function ensurePlatform(platform?: PlatformValue, defaultOverride?: PlatformValue): PlatformValue {
  const found = findPlatformFromArgv(platform);
  platform = found || platform;
  if (platform && !found) {
    process.argv.push('--platform', platform);
  }
  return platform || defaultOverride || _defaultPlatform;
}
