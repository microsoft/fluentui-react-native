export type PlatformValue = 'win32' | 'ios' | 'android' | 'windows' | 'web' | 'macos' | 'default';

const _defaultPlatform = 'default';
const _defaultVersion = 'react-native';

const _rnVersions: { [key in PlatformValue]: string } = {
  default: _defaultVersion,
  android: _defaultVersion,
  ios: _defaultVersion,
  macos: 'react-native-macos',
  web: 'react-native-web',
  win32: '@office-iss/react-native-win32',
  windows: 'react-native-windows'
};

export function getRNVersion(platform?: PlatformValue): string {
  return (platform && _rnVersions[platform]) || _rnVersions.default;
}

export function getAllRNVersions(): string[] {
  return Object.keys(_rnVersions)
    .map(ver => _rnVersions[ver])
    .filter(pkg => {
      try {
        return require.resolve(pkg);
      } catch {
        return false;
      }
    });
}

export function getAllPlatforms(): string[] {
  return Object.keys(_rnVersions).filter(plat => plat !== _defaultPlatform);
}

function findPlatformFromArgv(): PlatformValue | undefined {
  for (let index = 0; index < process.argv.length; index++) {
    if (process.argv[index] === 'platform') {
      const platformArg = process.argv[index + 1];
      return platformArg && _rnVersions[platformArg] ? (platformArg as PlatformValue) : undefined;
    }
  }
  return undefined;
}

export function findPlatform(): PlatformValue {
  return findPlatformFromArgv() || _defaultPlatform;
}

export function ensurePlatform(platform?: PlatformValue): PlatformValue {
  const found = findPlatformFromArgv();
  platform = found || platform;
  if (platform && !found) {
    process.argv.push('platform', platform);
  }
  return platform || _defaultPlatform;
}

export function findReactNativePackage(): string {
  return getRNVersion(findPlatform());
}
