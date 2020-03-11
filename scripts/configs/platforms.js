const _platformFlags = {
  android: { rnName: 'react-native' },
  ios: { rnName: 'react-native' },
  macos: { rnName: 'react-native-macos' },
  web: { rnName: 'react-native-web' },
  win32: { rnName: '@office-iss/react-native-win32' },
  windows: { rnName: 'react-native-windows' }
};

function getRNPackage(platform) {
  return (platform && _platformFlags[platform] && _platformFlags[platform].rnName) || 'react-native';
}

module.exports.getRNPackage = getRNPackage;

function getAllPlatforms() {
  return Object.keys(_platformFlags);
}

module.exports.getAllPlatforms = getAllPlatforms;
