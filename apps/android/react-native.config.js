'use strict';

const path = require('path');
const sourceDir = 'src';
module.exports = {
  project: {
    android: {
      sourceDir,
      manifestPath: path.relative(
        path.join(__dirname, sourceDir),
        path.join(
          path.dirname(require.resolve('react-native-test-app/package.json')),
          'android',
          'app',
          'src',
          'main',
          'AndroidManifest.xml',
        ),
      ),
    },
  },
};
