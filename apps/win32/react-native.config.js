const path = require('node:path');

const rnwPath = require.resolve('@office-iss/react-native-win32/package.json');

module.exports = {
  reactNativePath: path.dirname(rnwPath),
  assets: ['./assets/'],
};
