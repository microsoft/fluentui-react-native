const _defaultPlatform = 'default';
const _defaultVersion = 'react-native';

const _rnVersions = {
  default: _defaultVersion,
  android: _defaultVersion,
  ios: _defaultVersion,
  macos: 'react-native-macos',
  web: 'react-native-web',
  win32: '@office-iss/react-native-win32',
  windows: 'react-native-windows'
};

function getRNVersion(platform) {
  return (platform && _rnVersions[platform]) || _rnVersions.default;
}
module.exports.getRNVersion = getRNVersion;

function getAllRNVersions() {
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
module.exports.getAllRNVersions = getAllRNVersions;

function getAllPlatforms() {
  return Object.keys(_rnVersions).filter(plat => plat !== _defaultPlatform);
}
module.exports.getAllPlatforms = getAllPlatforms;

function findPlatformFromArgv() {
  for (let index = 0; index < process.argv.length; index++) {
    if (process.argv[index] === 'platform') {
      return process.argv[index + 1];
    }
  }
  return undefined;
}

function findPlatform() {
  return findPlatformFromArgv() || _defaultPlatform;
}

module.exports.findPlatform = findPlatform;

function ensurePlatform(platform) {
  const found = findPlatformFromArgv();
  platform = found || platform;
  if (platform && !found) {
    process.argv.push('platform', platform);
  }
  return platform || _defaultPlatform;
}

module.exports.ensurePlatform = ensurePlatform;

function findReactNativePackage() {
  return getRNVersion(findPlatform());
}

module.exports.findReactNativePackage = findReactNativePackage;
