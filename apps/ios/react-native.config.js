/**
 * This cli config is needed for the coexistance of react-native and other
 * out-of-tree implementations such react-native-macos.
 * The following issue is tracked by
 * https://github.com/react-native-community/discussions-and-proposals/issues/182
 *
 * The work-around involves having a metro.config.js for each out-of-tree
 * platform, i.e. metro.config.js for react-native and
 * metro.config.macos.js for react-native-macos.
 * This react-native.config.js looks for a --use-react-native-macos
 * switch and when present pushes --config=metro.config.macos.js
 * and specifies reactNativePath: 'node_modules/react-native-macos'.
 * The metro.config.js has to blacklist 'node_modules/react-native-macos',
 * and conversely metro.config.macos.js has to blacklist 'node_modules/react-native'.
 */
'use strict';

module.exports = {
  project: {
    android: {
      sourceDir: 'android',
      manifestPath: path.relative(
        path.join(__dirname, 'android'),
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
    ios: {
      project: (() => {
        const {
          packageSatisfiesVersionRange,
        } = require('react-native-test-app/scripts/configure');
        if (
          packageSatisfiesVersionRange(
            '@react-native-community/cli-platform-ios',
            '<5.0.2',
          )
        ) {
          // Prior to @react-native-community/cli-platform-ios v5.0.0,
          // `project` was only used to infer `sourceDir` and `podfile`.
          return 'ios/ReactTestApp-Dummy.xcodeproj';
        }

        // `sourceDir` and `podfile` detection was fixed in
        // @react-native-community/cli-platform-ios v5.0.2 (see
        // https://github.com/react-native-community/cli/pull/1444).
        return 'node_modules/.generated/ios/ReactTestApp.xcodeproj';
      })(),
    },
  },
};
